# CLAUDE.md

## User

This section is written by the user only. 
This folder will be used to serve a website.
When you commit, your name should be model name, version, and effort, e.g.
"Sonnet 5.5 High".
The email should be: `80226974+turibiusrozario@users.noreply.github.com`.
You are heavily sandboxed, so some tools may not be accessible to you.

## AI


### Tools

The following is copy pasted findings from another conversation as of 2026-10-27.

| Tool | Status | Notes |
|---|---|---|
| git 2.43 | works | Local commits OK |
| gh 2.45 | varies | Was logged in as `turibiusrozario` (scopes `repo`, `read:org`, `gist`); on 2026-10-25 later it reported "not logged into any GitHub hosts". Check `gh auth status` before pushing |
| network | works | github.com, api.github.com reachable |
| python3 3.12 | works | Local preview: `python3 -m http.server 8000`; also JSON/data generation |
| curl, dig, openssl, rsync | work | Use `dig` / `curl` to verify DNS and the live site |
| node, npm, jq | **missing** | Not needed; avoid |
| ssh key | none | Not needed; HTTPS is used |
| whois | missing | Not needed |

### Git setup (repo-local, no `~/.gitconfig` exists)

The following is copy pasted findings from another conversation as of 2026-10-27.
- `user.name` = model name + version + effort (e.g. `Sonnet 5.5 High`); the user states the effort level, since Claude can't read it. Update it if the model or effort changes.
- `user.email` = `80226974+turibiusrozario@users.noreply.github.com`.
- `credential.helper` = `!gh auth git-credential`. Without it, HTTPS push fails ("could not read Username").
- Commit messages end with the `Co-Authored-By: Claude ...` trailer given by the harness.
- No `workflow` scope on the token: cannot push `.github/workflows/*`. Don't use GitHub Actions.

