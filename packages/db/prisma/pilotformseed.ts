import { PrismaClient, ActivityType, VesselType, CraftType, FormStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

(async () => {
  try {
    console.log("Cleaning up database...");
    await prisma.user.deleteMany(); // Cascade will delete forms and crafts automatically

    console.log("Seeding Master Admin...");
    const adminPassword = await bcrypt.hash("AdminSecurePassword123!", 10);
    await prisma.user.create({
      data: {
        name: "Muhammad Bilal Khalid",
        email: "muhammadbilal41266@gmail.com",
        password: adminPassword,
        role: "ADMIN",
        isActive: true,
      },
    });

    console.log("Seeding Test Pilot...");
    const pilotPassword = await bcrypt.hash("PilotPassword123!", 10);
    const pilot = await prisma.user.create({
      data: {
        name: "Capt. Usman",
        email: "pilot.usman@ops.com",
        password: pilotPassword,
        role: "PILOT",
        isActive: true,
      },
    });

    console.log("Creating a mock Pilot Form for Capt. Usman...");
    const currentDateTime = new Date();
    
    // Creating Form and related Crafts together in one Prisma query
    const createdForm = await prisma.pilotForm.create({
      data: {
        serialNo: "55201",
        pilotId: pilot.id,
        status: FormStatus.SUBMITTED,
        
        // Activity & Vessel
        activityType: ActivityType.ARRIVAL,
        activityDateTime: currentDateTime,
        vesselType: VesselType.LNGC,
        vesselName: "Al-Qasim Star",
        registrationNo: "REG-9921",
        pcNo: "PC-442",
        localAgency: "Oceanic Shipping LLC",
        
        // Pilotage & Berthing
        boardingDate: currentDateTime,
        disembarkationDate: new Date(currentDateTime.getTime() + 4 * 60 * 60 * 1000), // 4 hours later
        berthSide: "Port Qasim Berth 2",
        isExtraPilotageNight: true,
        
        // Specs & Cargo
        loa: 280.5,
        beam: 45.0,
        gt: 55000,
        nt: 32000,
        dwt: 65000,
        draftFwd: 11.2,
        draftAft: 11.5,
        cargoPQ: 45000,
        deckCargo: 0,
        dgCargo: 5000,
        totalCargo: 50000,
        
        // Safety Checks
        abnormalTempRiseDG: false,
        leakageLiquidDG: false,
        stowagePlanDGAttached: true,
        additionalRemarks: "Vessel berthed safely despite strong winds.",
        
        // Creating 1-to-N relationships dynamically
        craftsUsed: {
          create: [
            {
              craftType: CraftType.PILOT_BOAT,
              craftName: "Pilot Boat 1",
              fromLocation: "Base",
              toLocation: "Vessel Boarding",
            },
            {
              craftType: CraftType.TUG,
              craftName: "Tug 2",
              fromLocation: "Channel Entry",
              toLocation: "Berth 2",
            }
          ]
        }
      },
    });

    console.log(`✅ Form successfully created with Serial: ${createdForm.serialNo}`);
    
    // --- VERIFICATION STEP (Fetching exactly as API would) ---
    console.log("\n🔍 Fetching and verifying Form data with Relations...");
    const fetchedForm = await prisma.pilotForm.findUnique({
      where: { id: createdForm.id },
      include: {
        pilot: { select: { name: true, email: true } },
        craftsUsed: true, // Bringing in the related normalized data
      }
    });

    console.dir(fetchedForm, { depth: null, colors: true });

  } catch (error) {
    console.error("Seeding failed:", error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
})();