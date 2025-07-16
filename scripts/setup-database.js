const { MongoClient } = require("mongodb")
const bcrypt = require("bcryptjs")

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/pms"

async function setupDatabase() {
  console.log("Setting up PMS database...")

  const client = new MongoClient(MONGODB_URI)

  try {
    await client.connect()
    const db = client.db("pms")

    // Create collections
    await db.createCollection("users")
    await db.createCollection("reviews")
    await db.createCollection("goals")

    // Hash passwords
    const adminPassword = await bcrypt.hash("AdminPMS@123", 10)
    const hodPassword = await bcrypt.hash("HodPMS@123", 10)
    const empPassword = await bcrypt.hash("EmpPMS@123", 10)

    // Insert demo users
    await db.collection("users").insertMany([
      {
        name: "System Administrator",
        email: "admin@company.com",
        password: adminPassword,
        role: "admin",
        department: "IT",
        employeeId: "EMP001",
        phone: "+1 (555) 000-0001",
        location: "New York, NY",
        joinDate: new Date("2020-01-01"),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "John Smith",
        email: "hod@company.com",
        password: hodPassword,
        role: "hod",
        department: "Engineering",
        employeeId: "HOD001",
        phone: "+1 (555) 000-0002",
        location: "San Francisco, CA",
        joinDate: new Date("2019-03-15"),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Sarah Johnson",
        email: "employee@company.com",
        password: empPassword,
        role: "employee",
        department: "Engineering",
        employeeId: "EMP002",
        phone: "+1 (555) 123-4567",
        location: "New York, NY",
        joinDate: new Date("2022-03-15"),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Michael Chen",
        email: "michael.chen@company.com",
        password: empPassword,
        role: "employee",
        department: "Product",
        employeeId: "EMP003",
        phone: "+1 (555) 234-5678",
        location: "San Francisco, CA",
        joinDate: new Date("2021-08-22"),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Emily Davis",
        email: "emily.davis@company.com",
        password: empPassword,
        role: "employee",
        department: "Design",
        employeeId: "EMP004",
        phone: "+1 (555) 345-6789",
        location: "Austin, TX",
        joinDate: new Date("2023-01-10"),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ])

    // Insert demo reviews
    await db.collection("reviews").insertMany([
      {
        employeeId: "EMP002",
        employeeName: "Sarah Johnson",
        employeeRole: "Software Engineer",
        reviewType: "Quarterly",
        period: "Q4 2025",
        status: "completed",
        score: 4.5,
        reviewer: "John Smith",
        reviewerId: "HOD001",
        dueDate: new Date("2024-12-15"),
        completedDate: new Date("2024-12-10"),
        ratings: {
          technical: 5,
          communication: 4,
          teamwork: 4,
          leadership: 4,
          problem_solving: 5,
          adaptability: 4,
          quality: 5,
          productivity: 4,
        },
        goals: "Complete React certification, Lead junior developer mentoring",
        achievements: "Successfully delivered 3 major features, Improved code review process",
        improvements: "Enhance public speaking skills, Learn advanced testing frameworks",
        comments: "Excellent technical performance with great attention to detail.",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ])

    // Insert demo goals
    await db.collection("goals").insertMany([
      {
        title: "Complete React Certification",
        description: "Obtain React Developer Certification to enhance frontend skills",
        employeeId: "EMP002",
        employee: "Sarah Johnson",
        employeeRole: "Software Engineer",
        category: "Professional Development",
        priority: "high",
        status: "in_progress",
        progress: 75,
        startDate: new Date("2024-01-15"),
        dueDate: new Date("2024-12-31"),
        createdBy: "HOD001",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        title: "Lead Junior Developer Mentoring",
        description: "Mentor 2 junior developers and help with their onboarding",
        employeeId: "EMP002",
        employee: "Sarah Johnson",
        employeeRole: "Software Engineer",
        category: "Leadership",
        priority: "medium",
        status: "in_progress",
        progress: 60,
        startDate: new Date("-02-01"),
        dueDate: new Date("-12-31"),
        createdBy: "HOD001",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ])

    console.log("✅ Database setup completed successfully!")
    console.log("\nDemo login credentials:")
    console.log("Admin: admin@company.com / AdminPMS@123")
    console.log("HOD: hod@company.com / hod123")
    console.log("Employee: employee@company.com / emp123")
  } catch (error) {
    console.error("❌ Error setting up database:", error)
  } finally {
    await client.close()
  }
}

setupDatabase()