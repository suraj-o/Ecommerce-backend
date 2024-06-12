import express  from "express";
import isAdmin from "../middlewares/admin.js";
import { BarChart, LineChart, addminDashboardStats, pieChart } from "../controllers/stats.js";

const stats =express.Router()

stats.get("/dasboard",isAdmin,addminDashboardStats)
stats.get("/dasboard/piecharts",isAdmin,pieChart)
stats.get("/dasboard/barcharts",isAdmin,BarChart)
stats.get("/dasboard/lineCharts",isAdmin,LineChart)

export default stats
