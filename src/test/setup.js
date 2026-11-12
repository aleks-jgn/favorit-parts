import { vi } from 'vitest';

// Тесты не должны зависеть от содержимого .env: ключ и базовый адрес задаём явно.
vi.stubEnv('VITE_FAVORIT_API_KEY', 'test-key');
vi.stubEnv('VITE_API_BASE_URL', '/api');
