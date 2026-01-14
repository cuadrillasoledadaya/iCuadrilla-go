---
description: Sincronizar cambios localmente y subir a GitHub sin confirmación manual
---
# Workflow Sync and Push

// turbo-all

Este workflow automatiza el despliegue a GitHub.

1. git add .
2. git commit -m "[Mensaje de versión]"
3. git pull --rebase
4. git push
5. $version = (Get-Content package.json | ConvertFrom-Json).version; git tag "v$version"; git push origin "v$version"
