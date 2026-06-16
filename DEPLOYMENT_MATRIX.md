# NACL-LAB Deployment Matrix

This repository is a product matrix, not one merged runtime. The portal and product lines share brand rules and repository history, while each app keeps its own build and deployment boundary.

## Apps

| App | Directory | Role | Local command | Coze boundary |
| --- | --- | --- | --- | --- |
| 盐究所 NACL-LAB | `nacl-lab/` | Main portal / electronic resume / product matrix entry | `pnpm run dev:nacl-lab` | Root `.coze` points to `nacl-lab` |
| 红了么 | `hong-le-mei/` | Xiaohongshu product line | `pnpm run dev:hong` | `hong-le-mei/.coze` |
| 爆了么 | `bao-le-me/` | Douyin / short-video product line | `pnpm run dev:bao` | `bao-le-me/.coze` |

## Proposed Domains

Preferred short scheme:

```text
nacl-lab.com       -> nacl-lab/
hong.nacl-lab.com  -> hong-le-mei/
bao.nacl-lab.com   -> bao-le-me/
```

Readable fallback:

```text
nacl-lab.com              -> nacl-lab/
honglemei.nacl-lab.com    -> hong-le-mei/
baoleme.nacl-lab.com      -> bao-le-me/
```

## Build Gates

Run from the repository root:

```bash
pnpm run build:nacl-lab
pnpm run validate:hong
pnpm run validate:bao
```

`pnpm run build:all` is available when all three apps must be compiled in one pass. Use app-specific scripts for daily work so one product line does not block unrelated edits.

## Deployment Rule

- Root deploy means the NACL-LAB portal.
- Product deploys happen from the product directory or its app-specific script.
- Do not put tokens, PATs, AI provider keys, customer data, or screenshots containing secrets in this repository.
- Do not claim online AI output is real unless the deployed app has confirmed production AI credentials and the result can be verified.

