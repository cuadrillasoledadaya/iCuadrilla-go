---
description: Sincronizar cambios, subir a GitHub con tag y forzar deploy en Vercel
---
# Workflow Sync and Push

// turbo-all

Este workflow automatiza el despliegue a GitHub y fuerza el redeploy en Vercel.

1. git add .
2. git commit -m "[Mensaje de versión]"
3. git pull --rebase
4. git push
5. $version = (Get-Content package.json | ConvertFrom-Json).version; git tag "v$version"; git push origin "v$version"
