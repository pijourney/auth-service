import Docker from "dockerode";

export default async (config: any) => {
  //do not run teardown in watch mode
  const docker = new Docker();

  console.log("teardown started");

  //tear it down
  var containerId = process.env.containerId || "default-containerId";

  await docker.getContainer(containerId).stop();
  await docker.getContainer(containerId).remove();
  console.log("teardown done");
};
