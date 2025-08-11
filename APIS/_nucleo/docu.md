# Documentacion API (desde factoria)

### Tabla de contenidos
- [Introduccion](#introduccion)
- [Instalacion](#instalacion)
- [Uso](#uso)





<a id='introduccion'></a>
## Introduccion
[Volver a Inicio de pagina](#)

Aquí tienes las rutas estándar (endpoints REST) para una API basada en la entidad **Item**, junto con ejemplos de JSON que se devuelven y los códigos HTTP apropiados para cada operación.

### Rutas estándar para la entidad `Item`

| Operación    | Método | URL                | Descripción                               | HTTP Code    |
|--------------|--------|--------------------|-------------------------------------------|--------------|
| Listar       | GET    | `/api/v1/items`       | Obtiene todos los items                   | 200 OK       |
| Crear        | POST   | `/api/v1/items`       | Crea un nuevo item                        | 201 Created  |
| Ver uno      | GET    | `/api/v1/items/:id`   | Obtiene un item por id                    | 200 OK / 404 |
| Actualizar   | PUT    | `/api/v1/items/:id`   | Reemplaza un item completo                | 200 OK / 404 |
| Actualizar   | PATCH  | `/api/v1/items/:id`   | Actualiza parcialmente un item            | 200 OK / 404 |
| Borrar       | DELETE | `/api/v1/items/:id`   | Elimina un item                           | 204 No Content / 404 |



<a id='instalacion'></a>
## Instalacion
[Volver a Inicio de pagina](#)

Invocar el cript ..........



<a id='uso'></a>
## Uso                                            
[Volver a Inicio de pagina](#)


### Ejemplos de respuesta JSON y códigos

### 1. Listar todos (`GET /api/items`)

**200 OK**
```json
{
  "status": "success",
  "data": [
    { "id": 1, "nombre": "Item 1", "precio": 10.5 },
    { "id": 2, "nombre": "Item 2", "precio": 25 }
  ],
  "message": null
}
```

### 2. Crear nuevo item (`POST /api/items`)

**Solicitud**
```json
{
  "nombre": "Nuevo Item",
  "precio": 50
}
```

**201 Created**
```json
{
  "status": "success",
  "data": {
    "id": 3,
    "nombre": "Nuevo Item",
    "precio": 50
  },
  "message": "Item creado correctamente"
}
```

### 3. Obtener un item por ID (`GET /api/items/2`)

**200 OK**
```json
{
  "status": "success",
  "data": { "id": 2, "nombre": "Item 2", "precio": 25 },
  "message": null
}
```
**404 Not Found**
```json
{
  "status": "error",
  "data": null,
  "message": "No se encontró el Item solicitado"
}
```

### 4. Actualizar un item (`PUT` o `PATCH /api/items/2`)

**200 OK**
```json
{
  "status": "success",
  "data": { "id": 2, "nombre": "Item actualizado", "precio": 30 },
  "message": "Item actualizado correctamente"
}
```
**404 Not Found**
```json
{
  "status": "error",
  "data": null,
  "message": "No se encontró el Item a actualizar"
}
```

### 5. Borrar un item (`DELETE /api/items/2`)

**204 No Content**

Sin cuerpo de respuesta.

**404 Not Found**
```json
{
  "status": "error",
  "data": null,
  "message": "No se encontró el Item a borrar"
}
```

[Volver a Inicio de pagina](#)

## Resumen:
- Rutinas CRUD tradicionales (`GET`, `POST`, `PUT/PATCH`, `DELETE`) sobre `/api/items` y `/api/items/:id`.
- Codificación uniforme en HTTP (`200`, `201`, `204`, `400`, `404`, `500` según el caso).
- El cuerpo de la respuesta usa JSON con campos `status`, `data` y `message`, siguiendo las mejores prácticas explicadas antes.