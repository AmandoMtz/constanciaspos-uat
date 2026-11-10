"""Convierte el Excel de tesistas a src/data/alumnos.json
Uso: python3 scripts/build_data.py ruta/al/archivo.xlsx
Solo toma filas con Id numérico y con ProgramaEducativo (tesistas)."""
import sys, json, pandas as pd
src = sys.argv[1]
df = pd.read_excel(src, usecols=[0,1,2,3,6,10,11,12])
df = df[pd.to_numeric(df.Id_Empleado, errors='coerce').notna()]
df = df[df.ProgramaEducativo.notna() & df.Grupo.notna()]
out = []
for _, r in df.iterrows():
    out.append({
        "id": int(r.Id_Empleado),
        "nombre": str(r.NombreE).strip(),
        "apellidoP": str(r.Apellido_P).strip(),
        "apellidoM": "" if pd.isna(r.Apellido_M) else str(r.Apellido_M).strip(),
        "programa": str(r.ProgramaEducativo).strip(),
        "grupo": str(r.Grupo).strip().upper(),
        "generacion": None if pd.isna(r.Ingreso_Generacion) else int(r.Ingreso_Generacion),
        "activo": bool(int(r.es_activo)) if not pd.isna(r.es_activo) else True,
    })
out.sort(key=lambda a: (a["apellidoP"], a["apellidoM"], a["nombre"]))
json.dump(out, open("src/data/alumnos.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print(len(out), "alumnos")
