import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import {fetchDashboardData} from '@/features/admin/dashboard/api/adminDashboardService';

interface DashboardState {
  statistics: {
    total_apartments: number;
    total_rented_apartment: number;
    total_rent_request: number;
    total_users: number;
    total_agents: number;
    total_admins: number;
    total_amount_generated: number;
    total_deleted_apartments: number;
  } | null;
  chartData: {
    [key: string]: {
      total_rent: string | number;
      total_apartments: string | number;
    };
  } | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: DashboardState = {
  statistics: null,
  chartData: null,
  isLoading: false,
  error: null
};

export const fetchDashboard = createAsyncThunk(
  'dashboard/fetchData',
  async (token: string, { rejectWithValue }) => {
    try {
      return await fetchDashboardData(token);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearDashboardError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboard.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDashboard.fulfilled, (state, action) => {
        state.isLoading = false;
        state.statistics = action.payload.statistics;
        state.chartData = action.payload.chartData;
      })
      .addCase(fetchDashboard.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  }
});

export const { clearDashboardError } = dashboardSlice.actions;
export default dashboardSlice.reducer;