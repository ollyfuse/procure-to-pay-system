import { User } from './types';

// This should work if User is properly exported
const testUser: User = {
  id: '1',
  username: 'test',
  email: 'test@test.com',
  first_name: 'Test',
  last_name: 'User',
  role: 'staff'
};

console.log('Types are working:', testUser);
