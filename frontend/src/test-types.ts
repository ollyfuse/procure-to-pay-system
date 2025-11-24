import type { User } from './types';


const testUser: User = {
  id: '1',
  username: 'test',
  email: 'test@test.com',
  first_name: 'Test',
  last_name: 'User',
  role: 'staff'
};

console.log('Types are working:', testUser);
