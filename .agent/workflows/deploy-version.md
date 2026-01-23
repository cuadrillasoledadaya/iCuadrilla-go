---
description: Desplegar nueva versión con tag automático
---

# Workflow: Desplegar Nueva Versión

Este workflow se debe ejecutar **SIEMPRE** después de actualizar la versión en `package.json`.

## Pasos

// turbo-all

1. **Agregar cambios al stage**

```bash
git add .
```

// turbo-all
2. **Crear commit con mensaje de versión**

```bash
git commit -m "release: v[VERSION] - [DESCRIPCIÓN BREVE]"
```

// turbo-all
3. **Crear tag con la versión**

```bash
git tag v[VERSION]
```

// turbo-all
4. **Subir cambios y tags**

```bash
git push origin main --tags
```

## Notas Importantes

- El tag SIEMPRE debe coincidir con la versión en `package.json`
- Formato del tag: `v1.3.13` (con la "v" al inicio)
- Los tags permiten que Vercel y otros sistemas identifiquen releases específicos
- NUNCA olvidar el flag `--tags` al hacer push

## Verificación

Para verificar que el tag se subió correctamente:

```bash
git tag -l
git ls-remote --tags origin
```
