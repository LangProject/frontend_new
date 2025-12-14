// src/auth.ts
//------------------------------------------------------------
// 100% MOCK backend for login / register
// No real server calls, no network requests
//------------------------------------------------------------

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    fullName?: string;
  };
}

export interface RegisterPayload {
  fullName: string;
  nickname: string;
  email: string;
  password: string;
}

// Fake delay to simulate real server
function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ------------------------ LOGIN ----------------------------
export async function apiLogin(data: LoginPayload): Promise<LoginResponse> {
  console.log("%cMOCK LOGIN → backend disabled", "color: #22c55e;");
  console.log("Login data:", data);

  await delay(700); // simulate network

  // Always "successful"
  return {
    token: "mock-token-123",
    user: {
      id: "mock-user-1",
      email: data.email,
      fullName: "Mock User",
    },
  };
}

// ----------------------- REGISTER --------------------------
export async function apiRegister(
  data: RegisterPayload
): Promise<LoginResponse> {
  console.log("%cMOCK REGISTER → backend disabled", "color: #3b82f6;");
  console.log("Register data:", data);

  await delay(900); // simulate network

  return {
    token: "mock-token-456",
    user: {
      id: "mock-user-2",
      email: data.email,
      fullName: data.fullName,
    },
  };
}
