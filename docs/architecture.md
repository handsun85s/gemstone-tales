# 宝石奇谭架构

站点以 HTML、CSS 和原生 JavaScript 运行。图鉴、探索和本地手记可以在静态页面完成，因此使用已有的 GitHub Pages 工作流提供公开访问。运行与发布步骤见 [README](../README.md)。

- `dist/index.html` 加载 `gems.js` 和 `gems-expansion.js` 组成的图鉴数据。条目 ID 关联关卡、照片署名、收藏和手记，同一个 ID 在升级后应保留。
- `island-routes.js` 按章节列出条目和案件。 `island.js` 负责地图、证据和答题，基于通过的两次判断开放领取操作。 `island-progress.js` 校验并写入已完成 ID。
- `app.js` 负责图鉴、手记和观察任务。冒险页通过浏览器事件传递条目 ID，打开同一颗宝石的图鉴或预选手记。
- 浏览器按站点来源保存数据。 `gemstone-tales:adventure:v1` 存放印章和已破案件 ID，`gemstone-tales:v1` 存放收藏、浏览记录和手记。已领取结果随刷新恢复，未提交题目属于当前弹窗会话。公开网址、旧站点域名和本地地址各有自己的存档。
- 每次正常写入手记、收藏或浏览记录之前重新读取当前存档，再应用这一项操作。其他标签页通过 `storage` 事件刷新显示。存储失败后，该页面保留内存中的改动，可导出手记。两个页面完全同时写入时，浏览器的本地存储不提供事务。

在本目录运行 `npm start`，通过 `http://127.0.0.1:4173/#island-trails` 进入主流程。 `npm run check` 检查内容字段、图片许可元数据、全量关卡规则及 Playground 资源。关卡用模拟页面验证实际事件处理器，真实浏览器的验收另见 [进度](progress.md)。建议以 GitHub Pages 源目录为交接入口。工作区相邻的 `gemstone-tales` 目录是早期 Sites 版本，其中仍是三站逻辑。

Pages 的工作流在 `main` 上先运行检查，再上传 `dist/`。静态资源链接使用项目内相对路径，以支持仓库子路径。
