import { http, HttpResponse } from 'msw'

export const URL_ESTUDIANTES = '*/api/estudiantes'

export const handlers = [http.get(URL_ESTUDIANTES, () => HttpResponse.json([]))]
