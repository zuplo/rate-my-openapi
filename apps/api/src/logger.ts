/* eslint-disable @typescript-eslint/no-explicit-any */
import { FastifyReply, FastifyRequest } from "fastify";
import { Writable } from "node:stream";
import pino, { LogFn, Logger } from "pino";
import { parse as parseStack } from "stacktrace-parser";

export const GOOGLE_TRACE_PROPERTY = "logging.googleapis.com/trace";
export const GOOGLE_LABELS_PROPERTY = "logging.googleapis.com/labels";
const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT_ID || "unknown";

import { randomUUID } from "node:crypto";

export const REQUEST_ID_HEADER = "zp-rid";

export const requestIdGenerator = (request: FastifyRequest): string => {
  const traceHeader = request.headers[REQUEST_ID_HEADER];

  if (traceHeader) {
    return traceHeader as string;
  }

  return randomUUID();
};

// NOTE: Had to add this stripped down interface because using pino's
// throws error "Exported variable 'LoggerOptions' has or is using name 'redactedOptions' from external module 'local/path' but cannot be named"
interface LoggerOpts {
  level: string;
  /**
   * The string key for the 'message' in the JSON object. Default: "msg".
   */
  messageKey?: string;
  customLevels?: { [key: string]: number };
  formatters?: {
    level?: (label: string, number: number) => object;
    bindings?: (bindings: pino.Bindings) => object;
    log?: (object: Record<string, unknown>) => Record<string, unknown>;
  };
  transport?:
    | pino.TransportSingleOptions
    | pino.TransportMultiOptions
    | pino.TransportPipelineOptions;
  serializers?: { [key: string]: pino.SerializerFn };
  redact?: string[];
  hooks?: {
    logMethod?: (
      this: Logger,
      args: Parameters<LogFn>,
      method: LogFn,
      level: number
    ) => void;
  };
}

function flatJSONString(s: any) {
  return JSON.stringify(s).replace(/^{/, "").replace(/}$/, "");
}

function logMethod(
  this: Logger,
  args: Parameters<LogFn>,
  method: LogFn,
  level: number
) {
  if (args.length === 2 && typeof args[1] === "object" && args[1] !== null) {
    args[0] = `${args[0]} ${JSON.stringify(args[1])}`;
  }

  // Per GCP docs:
  // If your log entry contains an exception stack trace,
  // the exception stack trace should be set in this message
  // JSON log field, so that the exception stack trace can
  // be parsed and saved to Error Reporting.
  if (
    args.length > 1 &&
    typeof args[0] === "object" &&
    typeof args[1] === "string"
  ) {
    const arg: any = args[0];
    if (arg.err instanceof Error && arg.err.stack) {
      args[1] = arg.err.stack;
      // Removing stack here to avoid duplication
      delete arg.err.stack;
    }
  }

  let originalChindings;
  try {
    const chindings = `{${
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this?.[pino.symbols.chindingsSym]?.slice(1) || ""
    }}`;

    originalChindings = JSON.parse(chindings);

    if (originalChindings) {
      if (originalChindings.trace) {
        // NOTE: GCP JSON log field format (https://cloud.google.com/logging/docs/structured-logging)
        // This will be used to correctly parse the trace field when we don't send the data via GCP logging api
        originalChindings[
          GOOGLE_TRACE_PROPERTY
        ] = `projects/${PROJECT_ID}/traces/${originalChindings.trace}`;
      }

      if (
        !originalChindings.trace &&
        originalChindings[GOOGLE_TRACE_PROPERTY]
      ) {
        // NOTE: We don't want to have a GCP trace property incorrectly assigned to a log line
        delete originalChindings[GOOGLE_TRACE_PROPERTY];
      }

      if (level >= 50) {
        const STACKTRACE_OFFSET = 0;
        const LINE_OFFSET = 7;
        // NOTE : we create an error we won't throw so we can get the call stack for this log line
        const caller = Error()
          .stack?.split("\n")
          .slice(2)
          .filter(
            (s) =>
              !s.includes("node_modules/pino") &&
              !s.includes("node_modules\\pino") &&
              !s.includes("node_modules/launchdarkly-node-server-sdk") &&
              !s.includes("node_modules\\launchdarkly-node-server-sdk")
          )
          [STACKTRACE_OFFSET].substr(LINE_OFFSET);
        originalChindings["caller"] = caller;
      }

      if (originalChindings["caller"] && level < 50) {
        delete originalChindings.caller;
      }

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this[pino.symbols.chindingsSym] = `,${flatJSONString(originalChindings)}`;

      return method.apply(this, args);
    }
  } catch (err) {
    // do nothing
  }

  return method.apply(this, args);
}

export function createNewLogger(
  defaultLabels: Record<string, string> = {},
  { logStream }: { logStream?: Writable } = {}
): pino.Logger {
  const loggerOptions: LoggerOpts = {
    /**
     * The logging level is a minimum level based on the associated value of that level.
     * For instance if logger.level is info (30) then all levels higher that 30 will be enabled and
     * those less than 30 will not.
     */
    level: process.env.LOG_LEVEL ?? "debug",
    /**
     * Paths in a log that hold sensitive data that needs to be redacted
     */
    redact: [
      'requestHeaders["authorization"]',
      'requestHeaders["cookie"]',
      'responseHeaders["authorization"]',
      'responseHeaders["cookie"]',
      "cookie",
    ],
  };

  const metadata: Record<string, string> = {
    project_id: PROJECT_ID,
  };

  loggerOptions.hooks = { logMethod };

  loggerOptions.formatters = {
    bindings(bindings) {
      metadata.pid = bindings.pid;
      metadata.hostname = bindings.hostname;
      return metadata;
    },
  };

  if (process.env.LOG_FORMAT === "gcp") {
    loggerOptions.messageKey = "message";
    loggerOptions.formatters = {
      level(_label, number) {
        return {
          severity: pinoLevelToStackDriverSeverity(number),
        };
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      log(object: any) {
        const labels: Record<string, string> = defaultLabels;

        // Attempt to parse the source location from an error
        if (object.err && object.err.stack) {
          try {
            const stack = parseStack(object.err.stack);
            if (stack.length > 0) {
              object["logging.googleapis.com/sourceLocation"] = {
                file: stack[0].file,
                line: stack[0].lineNumber,
                function: stack[0].methodName,
              };
            }
          } catch (err) {
            // ignore
          }
        }

        // Setup the Stackdriver httpRequest property on the log entry
        if (object.req) {
          const req = object.req as FastifyRequest;
          object.requestHeaders = req.raw.headers;
          object.httpRequest = {
            ...(object.httpRequest ?? {},
            {
              requestMethod: req.method,
              requestUrl: req.url,
              userAgent: req.headers["user-agent"],
              remoteIp: req.ip,
              protocol: req.protocol,
            }),
          };
          const zuploTraceID =
            (req.headers["zp-rid"] as string | null) ?? object.trace;

          // This is here so that we can search every type of log
          // by label.requestId (i.e. workers trace, etc.)
          labels.requestId = zuploTraceID;

          if (req.headers["cf-ray"]) {
            labels.rayId = req.headers["cf-ray"] as string;
          }
          if (req.headers["cf-worker"]) {
            labels.worker = req.headers["cf-worker"] as string;
          }
        }
        if (object.res) {
          const res = object.res as FastifyReply;
          object.responseHeaders = res.getHeaders();
          object.httpRequest = {
            ...(object.httpRequest ?? {},
            {
              requestMethod: res.request ? res.request.method : "",
              requestUrl: res.request ? res.request.url : "",
              status: res.statusCode,
              userAgent: res.request ? res.request.headers["user-agent"] : "",
              latency: `${truncateToDecimalPlace(
                res.getResponseTime() / 1000,
                9
              )}s`,
              remoteIp: res.request ? res.request.ip : "",
              protocol: res.request ? res.request.protocol : "",
            }),
          };
        }

        object[GOOGLE_LABELS_PROPERTY] = labels;

        return object;
      },
    };
    /* cspell: disable-next-line */
    loggerOptions.serializers = {
      // Nullifying the standard Fastify Request/Response serializer for better stack driver support
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      req(request: any) {
        return undefined;
      },
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      res(reply: any) {
        return undefined;
      },
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      responseTime: function (value) {
        return undefined;
      },
    };
  } else {
    loggerOptions.transport = {
      target: "pino-pretty",
      options: { destination: 1 },
    };
  }

  if (logStream) {
    // @ts-ignore
    return pino(loggerOptions, logStream);
  } else {
    // @ts-ignore
    return pino(loggerOptions);
  }
}

const enum PinoLogLevels {
  internal = 5,
  trace = 10,
  debug = 20,
  info = 30,
  warn = 40,
  error = 50,
  fatal = 60,
}

function pinoLevelToStackDriverSeverity(level: PinoLogLevels) {
  if (level === PinoLogLevels.trace || level === PinoLogLevels.debug) {
    return "debug";
  }
  if (level === PinoLogLevels.info) {
    return "info";
  }
  if (level === PinoLogLevels.warn) {
    return "warning";
  }
  if (level === PinoLogLevels.error) {
    return "error";
  }
  if (level === PinoLogLevels.internal) {
    return "internal";
  }
  if (level >= PinoLogLevels.fatal) {
    return "critical";
  }

  return "default";
}

function truncateToDecimalPlace(value: number, decimalPlace: number) {
  return (
    Math.trunc(value * Math.pow(10, decimalPlace)) / Math.pow(10, decimalPlace)
  );
}
