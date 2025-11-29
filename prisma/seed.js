/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const seatLayouts = {
  BUS_TWO_PLUS_TWO: {
    rows: 7,
    cols: 4,
  },
  TRAIN_TWO_PLUS_ONE: {
    rows: 6,
    cols: 5,
  },
};

function generateSeatMap(layoutKey) {
  const layout = seatLayouts[layoutKey] || seatLayouts.BUS_TWO_PLUS_TWO;
  const seats = [];
  const { rows, cols } = layout;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const rowLetter = String.fromCharCode(65 + r);
      const seatNumber = c + 1;
      seats.push(`${rowLetter}${seatNumber}`);
    }
  }
  return seats;
}

async function upsertRoute(id, startLocation, endLocation) {
  // Upsert by a known ID to avoid relying on a non-existent unique constraint
  return prisma.route.upsert({
    where: { id },
    update: { startLocation, endLocation },
    create: { id, startLocation, endLocation },
  });
}

async function upsertVehicle(id, data) {
  return prisma.vehicle.upsert({
    where: { id },
    update: data,
    create: { id, ...data },
  });
}

async function createTrip({ id, routeId, vehicleId, departureTime, arrivalTime, price }) {
  return prisma.trip.upsert({
    where: { id },
    update: { departureTime, arrivalTime, price, vehicleId, routeId },
    create: { id, routeId, vehicleId, departureTime, arrivalTime, price },
  });
}

async function createSeatsForTrip(tripId, layoutKey) {
  const seats = generateSeatMap(layoutKey);
  for (const seatNumber of seats) {
    await prisma.seat.upsert({
      where: { tripId_seatNumber: { tripId, seatNumber } },
      update: {},
      create: { tripId, seatNumber },
    });
  }
}

async function main() {
  // Routes
  const yangonToMandalay = await upsertRoute("route-yangon-mandalay", "Yangon", "Mandalay");
  const yangonToBagan = await upsertRoute("route-yangon-bagan", "Yangon", "Bagan");
  const yangonToNaypyitaw = await upsertRoute("route-yangon-naypyitaw", "Yangon", "Nay Pyi Taw");

  // Vehicles
  const busVehicle = await upsertVehicle("vehicle-bus-1", {
    type: "BUS",
    operator: "Mandalar Minn",
    seatLayout: "BUS_TWO_PLUS_TWO",
    seatMapJson: JSON.stringify({
      layout: "BUS_TWO_PLUS_TWO",
      seats: generateSeatMap("BUS_TWO_PLUS_TWO"),
    }),
  });

  const trainVehicle = await upsertVehicle("vehicle-train-1", {
    type: "TRAIN",
    operator: "Myanmar Rail",
    seatLayout: "TRAIN_TWO_PLUS_ONE",
    seatMapJson: JSON.stringify({
      layout: "TRAIN_TWO_PLUS_ONE",
      seats: generateSeatMap("TRAIN_TWO_PLUS_ONE"),
    }),
  });

  const demoVehicle = await upsertVehicle("vehicle-demo-1", {
    type: "BUS",
    operator: "Demo Express",
    seatLayout: "BUS_TWO_PLUS_TWO",
    seatMapJson: JSON.stringify({
      layout: "BUS_TWO_PLUS_TWO",
      seats: generateSeatMap("BUS_TWO_PLUS_TWO"),
    }),
  });

  // Trips
  const tripBus = await createTrip({
    id: "yangon-mandalay-bus",
    routeId: yangonToMandalay.id,
    vehicleId: busVehicle.id,
    departureTime: new Date("2025-12-01T07:30:00.000Z"),
    arrivalTime: new Date("2025-12-01T14:10:00.000Z"),
    price: 42000,
  });

  const tripTrain = await createTrip({
    id: "yangon-bagan-train",
    routeId: yangonToBagan.id,
    vehicleId: trainVehicle.id,
    departureTime: new Date("2025-12-02T18:00:00.000Z"),
    arrivalTime: new Date("2025-12-03T07:05:00.000Z"),
    price: 36000,
  });

  const demoTrip = await createTrip({
    id: "demo-trip",
    routeId: yangonToNaypyitaw.id,
    vehicleId: demoVehicle.id,
    departureTime: new Date("2025-12-05T10:00:00.000Z"),
    arrivalTime: new Date("2025-12-05T14:30:00.000Z"),
    price: 25000,
  });

  // Seats
  await createSeatsForTrip(tripBus.id, busVehicle.seatLayout);
  await createSeatsForTrip(tripTrain.id, trainVehicle.seatLayout);
  await createSeatsForTrip(demoTrip.id, demoVehicle.seatLayout);

  console.log("Seed completed");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
