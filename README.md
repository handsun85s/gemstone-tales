# 宝石奇谭

面向小学年龄孩子与家长的宝石观察平台。以真实标本照片和可核查资料为基础，把“认识 → 观察 → 提问 → 记录”串成一次完整探索。当前采用「A · 宝石冒险岛」界面。

## GitHub Pages 发布

仓库通过 [GitHub Actions](.github/workflows/pages.yml) 自动校验并发布 `dist/`，不需要安装依赖或设置部署密钥。每次推送到 `main` 或手动运行工作流都会触发发布。

首次使用需要在仓库 **Settings → Pages → Build and deployment → Source** 选择 **GitHub Actions**。部署结果可在仓库 **Actions → Deploy gemstone-tales to GitHub Pages** 查看；成功后的网址由该次工作流的 `github-pages` 环境提供。

站点资源使用相对路径，支持 GitHub Pages 的仓库子路径。发布文件仅包含静态网站，不包含开发配置或访问凭据。

## 运行

需要 Node.js 24，无需安装依赖。

```sh
npm start
```

访问 http://127.0.0.1:4173 。运行 `npm run check` 会检查 JavaScript 语法、宝石内容字段、问答答案范围、照片文件与署名许可完整性；单独检查内容可运行 `npm run validate:content`。科学准确性仍需人工复核资料。

## 当前正式版：A · 宝石冒险岛

正式首页采用冒险地图和“晶晶”伙伴，导航提供冒险地图、图鉴背包、探索任务、我的发现。五个章节各有十个站点。每站先读证据，再完成两道挑战。集齐本章印章即可打开综合案件，五件案件完成后获得「宝石研究员」称号。

发现印章以独立键 `gemstone-tales:adventure:v1` 保存，刷新后恢复，重复完成不会重复计数。原有 `gemstone-tales:v1` 的收藏、阅读记录和手记结构保持兼容；岛屿手记使用原有 `gem` 关联。数据保留以同一浏览器、同一站点来源为前提，localhost 与线上域名不共享本地数据。

- 50 种宝石和观赏材料均可探索。8 种提供标本照片，其余条目以图标配合证据卡。
- 搜索、常见颜色筛选、收藏、观察线索、成因与实际用途、解释式小测验。
- 3 个温和的亲子观察任务，写下发现后显示完成状态。
- 探索手记可新增、编辑、确认删除、导出 UTF-8 文本；误关弹窗后可恢复当前页面会话的草稿。
- 手机与桌面布局、键盘操作、原生模态框、减少动画偏好。

## 儿童 UI / UX Playground

在站点地址后打开 `playground/` 可比较四套可交互原型：A 宝石冒险岛（地图任务）、B 星际研究站（线索推理）、C 宝石贴纸册（自主认识和收集）、D 造物小工坊（观察纹样并创作）。总览支持方案深链接、手机预览、独立体验和标记喜欢的方案。

选择存于独立键 `gemstone-tales:playground-choice:v1`，不会自动替换正式界面。原型内部进度仅在当前页面体验中保留，与正式版手记互不影响；工坊可导出原创几何拼贴 SVG。设计依据、使用方式见 [Playground 说明](docs/ui-playground.md)。

## 文件与数据

- `dist/index.html`：页面骨架；`dist/styles.css`：响应式样式。
- `dist/app.js`：浏览器内交互。
- `dist/island.js` / `dist/island-progress.js`：正式冒险地图任务与独立印章存储；`dist/island.css` / `dist/adventure-theme.css`：地图与全站 A 风格。
- `dist/gems.js`、`dist/gems-expansion.js`：科普内容和逐条参考来源。章节路线和综合案件在 `dist/island-routes.js`。
- `dist/assets/credits.json`：真实照片的作者、许可、许可链接与原始页面。
- `.github/workflows/pages.yml`：校验并发布静态网站的工作流。
- `scripts/validate-content.mjs`：无额外依赖的发布前内容与资源校验。
- `scripts/check-adventure.mjs`：印章获章门槛、异常存储容错、旧数据隔离与正式版集成检查。
- [开源项目调研与采用决策](docs/open-source-research.md)：后续开发先查网络和 GitHub 的可用方案，核实许可证、知识质量、维护情况与适龄性后再选用。

已保存的收藏、阅读记录和手记保存在该站点来源下的 `localStorage`（键 `gemstone-tales:v1`）。不上传、不跨设备同步；清除浏览器数据会丢失，因此提供文本导出。未保存草稿只保留在当前页面会话中。科普资料用于认识与观察，不能替代专业矿物鉴定；莫氏硬度不代表抗摔能力，任务不要求刮划、敲击或研磨。

照片依各自 CC BY / CC BY-SA 许可复用，网站“资料与图片来源”中提供署名和链接。网页布局使用缩放与 CSS 混色显示，原始下载文件未改色。
