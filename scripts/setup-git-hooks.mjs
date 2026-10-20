import { execFileSync } from "node:child_process";

let isGitRepository = true;

try {
  execFileSync("git", ["rev-parse", "--is-inside-work-tree"], {
    stdio: "ignore",
  });
} catch {
  isGitRepository = false;
}

if (isGitRepository) {
  execFileSync("git", ["config", "--local", "core.hooksPath", ".githooks"], {
    stdio: "inherit",
  });
}
