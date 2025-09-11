import { test, expect, beforeAll, afterAll } from 'vitest'
import { createTestApp, createMockRequest, matchesSchema, parseJsonResponse } from '@rhinolabs/boilr-test'
import type { TestContext } from '@rhinolabs/boilr-test'
import { schema } from './[id].js'

let testContext: TestContext

beforeAll(async () => {
  testContext = await createTestApp({
    silent: true,
    routes: {
      dir: './src/routes'
    }
  })
})

afterAll(async () => {
  await testContext.cleanup()
})

test('GET /todos/:id returns specific todo', async () => {
  const response = await testContext.app.inject(createMockRequest({
    method: 'GET',
    url: '/todos/1'
  }))
  
  expect(response.statusCode).toBe(200)
  
  const data = matchesSchema(response, schema.get.response[200])
  expect(data.id).toBe(1)
  expect(data.title).toBeDefined()
  expect(data.completed).toBeDefined()
  expect(data.createdAt).toBeDefined()
})

test('GET /todos/:id returns 404 for non-existent todo', async () => {
  const response = await testContext.app.inject(createMockRequest({
    method: 'GET',
    url: '/todos/9999'
  }))
  
  expect(response.statusCode).toBe(404)
  
  const errorData = parseJsonResponse(response)
  expect(errorData).toHaveProperty('message')
})

test('PUT /todos/:id updates existing todo', async () => {
  const updateData = {
    title: 'Updated todo title',
    completed: true
  }
  
  const response = await testContext.app.inject(createMockRequest({
    method: 'PUT',
    url: '/todos/1',
    payload: updateData
  }))
  
  expect(response.statusCode).toBe(200)
  
  const data = matchesSchema(response, schema.put.response[200])
  expect(data.id).toBe(1)
  expect(data.title).toBe(updateData.title)
  expect(data.completed).toBe(updateData.completed)
})

test('PUT /todos/:id returns 404 for non-existent todo', async () => {
  const updateData = {
    title: 'Updated todo title',
    completed: true
  }
  
  const response = await testContext.app.inject(createMockRequest({
    method: 'PUT',
    url: '/todos/9999',
    payload: updateData
  }))
  
  expect(response.statusCode).toBe(404)
})

test('DELETE /todos/:id removes todo', async () => {
  const response = await testContext.app.inject(createMockRequest({
    method: 'DELETE',
    url: '/todos/2'
  }))
  
  expect(response.statusCode).toBe(204)
  expect(response.body).toBe('')
  
  const getResponse = await testContext.app.inject(createMockRequest({
    method: 'GET',
    url: '/todos/2'
  }))
  
  expect(getResponse.statusCode).toBe(404)
})

test('DELETE /todos/:id returns 404 for non-existent todo', async () => {
  const response = await testContext.app.inject(createMockRequest({
    method: 'DELETE',
    url: '/todos/9999'
  }))
  
  expect(response.statusCode).toBe(404)
})