// Simple localStorage-backed auth service for demo purposes

const USERS_KEY = 'users'
const AUTH_KEY = 'auth'

function getUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY)) || {}
  } catch {
    return {}
  }
}

function setUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

export function registerUser({ name, email, phone, password }) {
  const users = getUsers()
  if (users[email]) return false
  users[email] = { name, email, phone, password }
  setUsers(users)
  return true
}

export function loginUser(email, password) {
  const users = getUsers()
  const u = users[email]
  if (!u || u.password !== password) return false
  localStorage.setItem(AUTH_KEY, JSON.stringify({ email, name: u.name }))
  return true
}

export function logout() {
  localStorage.removeItem(AUTH_KEY)
}

export function isAuthed() {
  return !!localStorage.getItem(AUTH_KEY)
}