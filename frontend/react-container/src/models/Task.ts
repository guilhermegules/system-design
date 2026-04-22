export interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
}

export interface TaskStats {
  total: number;
  completed: number;
  pending: number;
}