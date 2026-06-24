# Salt Lab Deploy Handoff

Updated: 2026-06-24

## NACL-LAB

- App: `nacl-lab`
- Branch: `integrate/nacl-lab-visual-redesign`
- Deployable commit: `1da418878931329b7cd2fcc361a24c58ae5165c3`
- Status: ready for Claude deployment
- Verification: `npm run build` passed in `nacl-lab/`

## Domain Boundary

- `chan6.cn` and `www.chan6.cn` belong to NACL-LAB and Claude deployment.
- Codex must not deploy 大朱养小猪 to `chan6.cn` or `www.chan6.cn`.
- 大朱养小猪 moves to `zhu.chan6.cn`.
