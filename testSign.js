import { ECSClient, DescribeZonesCommand } from "@volcengine/ecs"; // 需安装对应的业务包

// 1. 使用环境变量中的 AK/SK，并指定 Region
// const client = new ECSClient({
//     region: "cn-beijing",
// });

// 2. 或者在代码中显式传入 AK/SK
const client = new ECSClient({
  accessKeyId: "AKLTM2I3OTljNDI4YTQ3NDcxM2EwZTMwNjU5YTA5NDExNmU",
  secretAccessKey: "T1RBMk1tSXdaVFprWmpZNU5EWTJaamxqT1RNek9XRmtNV015WkRNNE5HWQ==",
  region: "cn-north-1",
});

async function main() {
    try {
        // 发送请求 (具体 Command 需参考业务 SDK 文档)
        const command = new DescribeZonesCommand({});
        const response = await client.send(command);
        console.log(response);
    } catch (error) {
        console.error("Error:", error);
    }
}

main();