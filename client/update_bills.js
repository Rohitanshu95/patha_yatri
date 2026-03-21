import fs from 'fs';
const file = '../server/controllers/bill.controller.js';
let content = fs.readFileSync(file, 'utf8');

const newFunc = `
export const getAllBills = async (req, res, next) => {
  try {
    const bills = await Bill.find()
      .populate({
         path: 'booking_id',
         populate: [
            { path: 'guest_id' },
            { path: 'room_id' }
         ]
      })
      .sort({ createdAt: -1 });
    res.json(bills);
  } catch (error) {
    next(error);
  }
};
`;

if (!content.includes('getAllBills')) {
  content += '\n' + newFunc;
  fs.writeFileSync(file, content);
}

const routesFile = '../server/routes/bill.routes.js';
let rContent = fs.readFileSync(routesFile, 'utf8');
if (!rContent.includes('getAllBills')) {
  rContent = rContent.replace('} from "../controllers/bill.controller.js";', ', getAllBills } from "../controllers/bill.controller.js";');
  rContent = rContent.replace('router.use(authenticate);', 'router.use(authenticate);\n\nrouter.get("/", authorize(...RECEPTIONIST_PLUS), getAllBills);');
  fs.writeFileSync(routesFile, rContent);
}
