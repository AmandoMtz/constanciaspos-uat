# Constancias de Posgrado · FI Tampico – UAT

React + TypeScript + Vite. Sin login. Los datos (programas, historial, plantilla Word) se guardan en el navegador del equipo.

## Ejecutar en local
```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # genera /dist
```

## Publicar en Render (Static Site)
- Build command: `npm install && npm run build`
- Publish directory: `dist`
(o usa el `render.yaml` incluido)

## Base de datos de alumnos
`src/data/alumnos.json` se generó del Excel de tesistas, con su clasificación como Grupo A o Grupo B.
Para regenerarlo: `python3 scripts/build_data.py ruta/al/excel.xlsx`

## Plantilla Word
En la sección **Plantilla** se carga un .docx con campos entre llaves:
`ver la lista en la pantalla Plantilla`
Se guarda en IndexedDB del navegador. La plantilla de vigencias (`public/plantilla-vigencias.docx`) ya viene incluida y se usa mientras no se cargue otra.
