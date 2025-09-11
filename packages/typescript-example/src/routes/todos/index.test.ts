import { test, expect, beforeAll, afterAll } from 'vitest'
import { createTestApp, createMockRequest, matchesSchema, parseJsonResponse } from '@rhinolabs/boilr-test'
import type { TestContext } from '@rhinolabs/boilr-test'
import { schema } from './index.js'

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

test('GET /todos returns todos list', async () => {
  const response = await testContext.app.inject(createMockRequest({
    method: 'GET',
    url: '/todos'
  }))
  
  expect(response.statusCode).toBe(200)
  
  const data = matchesSchema(response, schema.get.response[200])
  expect(Array.isArray(data)).toBe(true)
  expect(data.length).toBeGreaterThan(0)
  
  data.forEach(todo => {
    expect(todo).toHaveProperty('id')
    expect(todo).toHaveProperty('title')
    expect(todo).toHaveProperty('completed')
    expect(todo).toHaveProperty('createdAt')
  })
})

test('POST /todos creates a new todo', async () => {
  const newTodo = {
    title: 'Test todo from automated test',
    completed: false
  }
  
  const response = await testContext.app.inject(createMockRequest({
    method: 'POST',
    url: '/todos',
    payload: newTodo
  }))
  
  expect(response.statusCode).toBe(201)
  
  const data = matchesSchema(response, schema.post.response[201])
  expect(data.title).toBe(newTodo.title)
  expect(data.completed).toBe(newTodo.completed)
  expect(data.id).toBeDefined()
  expect(data.createdAt).toBeDefined()
})

test('POST /todos validates required fields', async () => {
  const invalidTodo = {
    completed: false
  }
  
  const response = await testContext.app.inject(createMockRequest({
    method: 'POST',
    url: '/todos',
    payload: invalidTodo
  }))
  
  expect(response.statusCode).toBe(400)
  
  const errorData = parseJsonResponse(response)
  expect(errorData).toHaveProperty('message')
  expect(errorData.details).toBeDefined()
})

test('POST /todos validates title is not empty', async () => {
  const invalidTodo = {
    title: '',
    completed: false
  }
  
  const response = await testContext.app.inject(createMockRequest({
    method: 'POST',
    url: '/todos',
    payload: invalidTodo
  }))
  
  expect(response.statusCode).toBe(400)
  
  const errorData = parseJsonResponse(response)
  expect(errorData).toHaveProperty('message')
})