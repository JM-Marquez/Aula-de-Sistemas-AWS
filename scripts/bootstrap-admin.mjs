import { randomBytes, randomUUID, scryptSync } from "node:crypto";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, TransactWriteCommand } from "@aws-sdk/lib-dynamodb";

const REGION = "us-east-1";
const TABLE = "QuizArena-taller";

function askHidden(prompt) {
  if (!stdin.isTTY || !stdin.setRawMode) {
    throw new Error("Ejecuta este script desde una terminal interactiva.");
  }

  return new Promise((resolve, reject) => {
    let value = "";
    stdout.write(prompt);
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding("utf8");

    const cleanup = () => {
      stdin.setRawMode(false);
      stdin.pause();
      stdin.removeListener("data", onData);
      stdout.write("\n");
    };

    const onData = (chunk) => {
      for (const char of chunk) {
        if (char === "\u0003") {
          cleanup();
          reject(new Error("Operación cancelada."));
          return;
        }
        if (char === "\r" || char === "\n") {
          cleanup();
          resolve(value);
          return;
        }
        if (char === "\u007f" || char === "\b") {
          value = value.slice(0, -1);
        } else if (char >= " ") {
          value += char;
        }
      }
    };

    stdin.on("data", onData);
  });
}

function hashPassword(password) {
  const salt = randomBytes(16);
  const derived = scryptSync(password, salt, 64, {
    N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024
  });
  return `scrypt$16384$8$1$${salt.toString("base64url")}$${derived.toString("base64url")}`;
}

async function main() {
  const rl = createInterface({ input: stdin, output: stdout });

  try {
    const email = (await rl.question("Correo del administrador: ")).trim().toLowerCase();
    const name = (await rl.question("Nombre del administrador: ")).trim().replace(/\s+/g, " ");
    rl.close();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error("El correo no tiene un formato válido.");
    }
    if (name.length < 2 || name.length > 40) {
      throw new Error("El nombre debe tener entre 2 y 40 caracteres.");
    }

    const password = await askHidden("Contraseña (mínimo 12 caracteres): ");
    if (password.length < 12 || password.length > 200) {
      throw new Error("La contraseña debe tener entre 12 y 200 caracteres.");
    }

    const id = randomUUID();
    const createdAt = new Date().toISOString();
    const passwordHash = hashPassword(password);

    const client = DynamoDBDocumentClient.from(
      new DynamoDBClient({ region: REGION })
    );

    await client.send(new TransactWriteCommand({
      TransactItems: [
        {
          Put: {
            TableName: TABLE,
            Item: {
              PK: `USER#${id}`,
              SK: "PROFILE",
              entity: "USER",
              id,
              email,
              name,
              createdAt,
              passwordHash
            },
            ConditionExpression: "attribute_not_exists(PK)"
          }
        },
        {
          Put: {
            TableName: TABLE,
            Item: {
              PK: `EMAIL#${email}`,
              SK: "USER",
              entity: "EMAIL",
              userId: id
            },
            ConditionExpression: "attribute_not_exists(PK)"
          }
        }
      ]
    }));

    console.log(`Administrador creado correctamente: ${email}`);
    console.log("Ya puedes probar el inicio de sesión.");
  } finally {
    if (!rl.closed) rl.close();
  }
}

main().catch((error) => {
  console.error("No se pudo crear el administrador:", error.message);
  process.exitCode = 1;
});
