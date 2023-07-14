import { type FastifyPluginAsync } from "fastify";
import axios, { isAxiosError } from "axios";
import { OpenAPIV3, OpenAPIV3_1 } from "openapi-types";
import { join } from "node:path";
import util from "node:util";
import { exec } from "child_process";
import {
  RatingOutput,
  SpectralReport,
  generateOpenApiRating,
} from "@rate-my-openapi/core";
import { bundleAndLoadRuleset } from "@stoplight/spectral-ruleset-bundler/with-loader";
import * as fs from "node:fs";
import * as Parsers from "@stoplight/spectral-parsers";
import * as spectralCore from "@stoplight/spectral-core";
import * as GoogleCloudStorage from '@google-cloud/storage';

const { GOOGLE_APPLICATION_CREDENTIALS: keyFilename, GOOGLE_CLOUD_STORAGE_BUCKET: bucket } = process.env;

const storage = new GoogleCloudStorage.Storage({
  projectId: "rate-my-openapi",
  keyFilename
});

const execAwait = util.promisify(exec);

const rateRouteSchema = {
  params: {
    type: 'object',
    properties: {
      id: { type: 'string' },
    }
  },
};

const rateRoute: FastifyPluginAsync = async (server) => {
  server.route<{ Params: { id: string } }>({
    method: "GET",
    url: "/rate/:id",
    schema: rateRouteSchema,
    handler: async (request, reply) => {
      const { id } = request.params;

      const { data } = await axios.get(`https://storage.googleapis.com/${bucket}/${id}.json`);

      let ratingData;
      try {
        ratingData = await getRating(data, id);
      } catch (e) {
        throw new Error(e);
      }

      if (ratingData && bucket) {
        let signedUrl;
        const [url] = await storage
          .bucket(bucket)
          .file(`${id}-rating.json`)
          .getSignedUrl({
            version: 'v4',
            action: 'write',
            expires: Date.now() + 15 * 60 * 1000, // 15 minutes
            contentType: 'application/octet-stream',
          }).catch(() => {
            throw new Error('Unable to generate signed URL');
          });

        if (url) {
          signedUrl = url;
        }

        if (signedUrl) {
          const headers = {
            'Content-Type': 'application/octet-stream'
          };
          
          let fileUploadSuccess = false;
          try {
            const { status } = await axios.put(signedUrl, Buffer.from(JSON.stringify(ratingData)), { headers });

            if (status === 200) {
              fileUploadSuccess = true;
            }
          } catch (e) {
            if (isAxiosError(e)) {
              throw new Error(e.response?.data);
            }
          }

          if (fileUploadSuccess) {
            try {
              // send email?
            } catch {
              throw new Error();
            }

            reply.send();
          }
        }
      } else {
        throw new Error(`Rating data was not returned for file ${id}`);
      }
    },
  });
};

const getRating = async (apiFileJson: OpenAPIV3_1.Document | OpenAPIV3.Document, id: string) => {
  const tempApiFilePath = `temp_uploads/${id}.json`;
  fs.writeFile(tempApiFilePath, Buffer.from(JSON.stringify(apiFileJson)), (err) => {
    if (err) {
      throw new Error(`Unable to write temporary upload file. File ID: ${id}`);
    }
  });
  
  const rulesetPath = join(
    process.cwd(),
    "../",
    "../",
    "rulesets/rules.vacuum.yaml"
  );

  let vacuumCliReport;
  try {
    const { stdout, stderr } = await execAwait(
      `vacuum spectral-report -r ${rulesetPath} -o ${tempApiFilePath}`,
      { maxBuffer: undefined }
    );

    if (stderr) {
      throw new Error(stderr);
    }

    if (!stdout) {
      throw new Error(`No output from Vacuum. Confirm the file is not empty. File ID: ${id}`);
    }

    vacuumCliReport = stdout;
  } catch {
    throw new Error('Could not execute Vacuum CLI command.')
  }
  
  if (vacuumCliReport) {
    let spectralOutputReport;
    try {
      const openApiSpectralDoc = new spectralCore.Document(
        JSON.stringify(apiFileJson),
        Parsers.Json,
        tempApiFilePath
      );

      const spectral = new spectralCore.Spectral();
      const rulesetFilepath = join(
        process.cwd(),
        "../",
        "../",
        "rulesets",
        ".spectral-supplement.yaml"
      );
      
      try {
        const spectralRuleset = await bundleAndLoadRuleset(rulesetFilepath, { fs, fetch });
        spectral.setRuleset(spectralRuleset);
      } catch {
        throw new Error('Unable to set Spectral ruleset');
      }

      spectralOutputReport = await spectral.run(
        openApiSpectralDoc
      );
    } catch (e) {
      console.error(e || 'Could not generate Spectral report');
    }

    const initialOutputReport: SpectralReport = JSON.parse(vacuumCliReport);
    const outputReport = spectralOutputReport ? [...initialOutputReport, ...spectralOutputReport] : initialOutputReport;
    
    const output: RatingOutput = generateOpenApiRating(outputReport, apiFileJson);

    fs.unlink(tempApiFilePath, (err) => {
      if (err) {
        console.error(`Unable to delete temporary upload file. File ID: ${id}`)
      }
    });
    
    return output;
  } else {
    throw new Error('Vacuum CLI command succeeded but did not generate a report');
  }
}

export default rateRoute;
