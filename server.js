const http = require("http");
const { v4: uuidv4 } = require("uuid");
const errorHandle = require("./errorHandle");
const { error } = require("console");

let todoList = [];

const requestListener = (req, res) => {
  // const head = { "Content-Type": "text/plain" };
  const head = {
    "Access-Control-Allow-Headers":
      "Content-Type, Authorization, Content-Length, X-Requested-With",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "PATCH, POST, GET,OPTIONS,DELETE",
    "Content-Type": "application/json",
  };

  let body = "";

  req.on("data", (chunk) => {
    body += chunk;
  });

  if (req.url === "/todoList" && req.method === "GET") {
    res.writeHead(200, head);
    res.write(
      JSON.stringify({
        status: "success",
        data: todoList,
      })
    );
    res.end();
  } else if (req.url === "/todo" && req.method === "POST") {
    req.on("end", () => {
      try {
        const title = JSON.parse(body).title;
        if (!title) throw "未輸入 todo 標題";

        const todo = {
          id: uuidv4(),
          title,
        };

        todoList.push(todo);

        res.writeHead(200, head);
        res.write(
          JSON.stringify({
            status: "success",
            data: todoList,
          })
        );
        res.end();
      } catch (error) {
        errorHandle(res, error);
      }
    });
  } else if (req.url === "/todoList" && req.method === "DELETE") {
    todoList = [];

    res.writeHead(200, head);
    res.write(
      JSON.stringify({
        status: "success",
        data: todoList,
      })
    );
    res.end();
  } else if (req.url.startsWith("/todo") && req.method === "DELETE") {
    const id_delete = req.url.split("/").at(-1);
    const target_index = todoList.findIndex((item) => {
      return item.id === id_delete;
    });

    // if (!(target_index + 1)) {
    if (target_index === -1) errorHandle(res, "id doesn't exist");
    else {
      todoList.splice(target_index, 1);

      res.writeHead(200, head);
      res.write(
        JSON.stringify({
          status: "success",
          data: todoList,
        })
      );
      res.end();
    }
  } else if (req.url.startsWith("/todo") && req.method === "PATCH") {
    req.on("end", () => {
      try {
        const title = JSON.parse(body).title;
        const target_id = req.url.split("/").at(-1);
        const target_index = todoList.findIndex(
          (item) => item.id === target_id
        );

        if (!title) throw "未輸入 todo 標題";
        if (target_index === -1)
          throw "此筆 todo 不存在，請輸入預修改 todo 正確 id";

        todoList[target_index].title = title;

        res.writeHead(200, head);
        res.write(
          JSON.stringify({
            status: "success",
            data: todoList,
          })
        );
        res.end();
      } catch (error) {
        errorHandle(res, error);
      }
    });
  } else {
    res.writeHead(404, head);
    res.write(
      JSON.stringify({
        status: false,
        message: "無此網站路由",
      })
    );
    res.end();
  }
};

const server = http.createServer(requestListener);
server.listen(3005);

// // rewrite 是因為雲端部屬服務會有自己的試射 port 號碼，這邊先跟進
// server.listen(process.env.PORT || 3005);
