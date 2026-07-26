import { afterEach, describe, expect, it, vi } from 'vitest'
import { createPost, deletePost, fetchPosts } from './dataStormApi'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('Data Storm API service', () => {
  it('fetches posts from the backend', async () => {
    const posts = [{ _id: 'post-1', title: 'Stored post' }]
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: posts }),
    })
    vi.stubGlobal('fetch', fetchMock)

    await expect(fetchPosts()).resolves.toEqual(posts)
    expect(fetchMock).toHaveBeenCalledWith('http://localhost:5000/posts', {
      signal: undefined,
    })
  })

  it('creates a post with multipart form data', async () => {
    const createdPost = { _id: 'post-2', title: 'Created post' }
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: createdPost }),
    })
    vi.stubGlobal('fetch', fetchMock)

    await expect(
      createPost({
        title: 'Created post',
        content: 'Created from React',
        authorName: 'Harman',
        authorEmail: 'harman@example.com',
        thumbnail: null,
      }),
    ).resolves.toEqual(createdPost)

    const [, request] = fetchMock.mock.calls[0]
    expect(request.method).toBe('POST')
    expect(request.body).toBeInstanceOf(FormData)
    expect(request.body.get('title')).toBe('Created post')
    expect(request.body.get('authorEmail')).toBe('harman@example.com')
  })

  it('deletes a post by id', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ message: 'Post deleted successfully' }),
    })
    vi.stubGlobal('fetch', fetchMock)

    await deletePost('post-3')
    expect(fetchMock).toHaveBeenCalledWith('http://localhost:5000/posts/post-3', {
      method: 'DELETE',
    })
  })

  it('throws clean API errors', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ message: 'Backend unavailable' }),
    })
    vi.stubGlobal('fetch', fetchMock)

    await expect(fetchPosts()).rejects.toThrow('Backend unavailable')
  })
})
