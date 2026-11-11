## Issue tracker

The workspace values the skills read are in [`docs/issue-tracker.md`](https://github.com/mcwestling/factory/blob/HEAD/docs/issue-tracker.md) in `mcwestling/factory`.

## Scripts

Write scripts in TypeScript by default, run directly with Node (no build step). Use Python 3 with only the standard library for tools that ship into repos regardless of their stack, like [Factory Verify](https://linear.app/mcwestling/project/factory-verify-00114d9892fe/overview), or when Python's standard library makes the script much simpler, like parsing TOML. Don't add Ruby, or shell scripts longer than a few lines.

## Pull requests

- **Review:** no PR autopilot in this repo. PRs open as drafts; the maintainer marks them ready and merges.
