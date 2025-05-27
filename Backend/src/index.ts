import { server } from "./infra/server";
import mongo from "./infra/mongoose";
const PORT = process.env.PORT||4050;
mongo();
server.listen(PORT, () => {
  console.log("server started in ", PORT);
});
