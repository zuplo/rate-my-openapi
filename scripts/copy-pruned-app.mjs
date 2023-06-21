import { existsSync, lstatSync } from "fs";
import { cp, mkdir, readFile, rm } from "fs/promises";
import glob from "glob";
import path from "path";

// Generate the output script
// npx esbuild ./scripts/copy-pruned-app.mjs --bundle --outfile=./scripts/copy-pruned-app.out.js --platform=node --format=cjs

/**
 * Directories and files that will be ignored when copying full directories
 */
const appIgnoredDirs = ["node_modules", "dist", ".git", "terraform"];
const appIgnoredFiles = ["tsconfig.tsbuildinfo"];
/**
 * JSON files used in pre-build steps
 */
const appJsonFiles = ["package.json", "tsconfig.json"];

/**
 * Files that are copied from the root of the workspace
 */
const baseFiles = [
  "package.json",
  "package-lock.json",
  "tsconfig.base.json",
  "tsconfig.json",
];

async function run() {
  const filterPackage = process.argv[2];
  const rootDir = process.cwd();

  const outDir = path.join(rootDir, "./out");
  const outDirJson = path.join(outDir, "/json");
  const outDirFull = path.join(outDir, "/full");

  console.log(`Copying ${filterPackage} and dependencies to ${outDir}`);

  async function getWorkspaces() {
    const { workspaces } = await readFile(
      path.join(rootDir, "package.json"),
      "utf-8"
    ).then(JSON.parse);
    const workspaceGlobs = Object.keys(workspaces)
      .map((workspace) => workspaces[workspace])
      .flat();
    const workspacePaths = [];
    for (const workspaceGlob of workspaceGlobs) {
      workspacePaths.push(
        ...glob.sync(workspaceGlob, {
          cwd: rootDir,
        })
      );
    }

    const data = [];
    for (const workspacePath of workspacePaths) {
      if (!existsSync(workspacePath)) {
        throw new Error(`Workspace path ${workspacePath} does not exist`);
      }
      const pkgJsonPath = path.join(workspacePath, "package.json");
      if (existsSync(pkgJsonPath)) {
        const pkgJson = await readFile(pkgJsonPath, "utf-8").then(JSON.parse);
        pkgJson.realpath = workspacePath;
        data.push(pkgJson);
      }
    }

    const workspaceMap = new Map();
    data.forEach((pkg) => {
      workspaceMap.set(pkg.name, pkg);
    });
    return workspaceMap;
  }

  await rm(outDir, { recursive: true, force: true });

  const workspaces = await getWorkspaces();

  /**
   * Gather JSON files and full directories for all packages
   */
  function filterWorkspaces(pkgName, resolvedWorkspaces) {
    // const pkgJsonPath = path.join(pkgDir, "package.json");
    // const pkg = await readFile(pkgJsonPath, "utf-8").then(JSON.parse);

    const workspace = workspaces.get(pkgName);
    if (!workspace) {
      return;
    }

    resolvedWorkspaces.set(pkgName, workspace);

    for (const depName of Object.keys(workspace.dependencies || {})) {
      filterWorkspaces(depName, resolvedWorkspaces);
    }
  }

  const filteredWorkspaces = new Map();
  filterWorkspaces(filterPackage, filteredWorkspaces);

  for (const workspace of filteredWorkspaces.values()) {
    const { name, realpath } = workspace;

    console.log(`Copying ${name} from ${realpath}`);
    const appOutJsonDir = path.join(
      outDirJson,
      path.relative(rootDir, realpath)
    );
    const appOutFullDir = path.join(
      outDirFull,
      path.relative(process.cwd(), realpath)
    );

    // Create output directories
    await mkdir(appOutJsonDir, { recursive: true });

    // Copy JSON files
    for (const file of appJsonFiles) {
      const src = path.join(realpath, file);
      const dest = path.join(appOutJsonDir, file);
      const outDir = path.resolve(dest, "../");

      if (!existsSync(outDir)) {
        await mkdir(outDir, { recursive: true });
      }
      if (existsSync(src)) {
        await cp(src, dest);
      }
    }

    // Copy full module directory
    await mkdir(appOutFullDir, { recursive: true });
    await cp(realpath, appOutFullDir, {
      recursive: true,
      filter: (path) => {
        if (lstatSync(path).isFile()) {
          return !appIgnoredFiles.some((name) => path.endsWith(name));
        }
        // Include all bundled files
        if (path.indexOf("/core/bundled/") > -1) {
          return true;
        }
        // Ignore directories that are not in the appIgnoredDirs list
        return !appIgnoredDirs.some((name) => path.indexOf(name) > -1);
      },
    });
  }

  // Copy Base files
  for (const file of baseFiles) {
    await cp(path.join(process.cwd(), file), path.join(outDirJson, file));
    await cp(path.join(process.cwd(), file), path.join(outDirFull, file));
  }
}

run()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .then(() => {
    console.log("Finished");
    process.exit(0);
  });
