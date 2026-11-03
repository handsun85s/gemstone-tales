# 开源项目调研与采用决策

调研日期：2026-11-03。目标：优先改善 9 岁孩子的“认识标本 → 观察 → 提问 → 记录”体验，再考虑扩展。

本次通过网络搜索定位项目，直接阅读 GitHub 仓库的 README、LICENSE、提交和发布记录，并抽查涉及的矿物知识。本次为静态审查，未安装、运行或集成这些第三方项目；下列功能是仓库声明，不代表已完成运行验证。提交日期均为 UTC，不将仓库 `pushed_at` 当作最后代码提交日期，也不以星标数判断可用性。

## 候选与决策

### 1. GemAtlas：采用内容建模与发布前校验的思路

- 仓库：[cang-ge/gematlas](https://github.com/cang-ge/gematlas)。[README](https://github.com/cang-ge/gematlas/blob/master/README.md) 描述以 YAML 管理双语宝石知识，用 Schema、测试和生成流程构建静态图鉴，涵盖分类、鉴别、切工、分级与图库。
- 许可：[MIT](https://github.com/cang-ge/gematlas/blob/master/LICENSE)。若复用代码或实质性文档，须保留相应版权与许可；图库和外部素材仍应逐项核对来源及授权。
- 维护证据：默认分支为 `master`；最近提交为 [4a69276](https://github.com/cang-ge/gematlas/commit/4a69276dd7d25637c1196e760783329cb78ef793)，2026-10-01，涉及产品和工作流；前一条 [11e1dea](https://github.com/cang-ge/gematlas/commit/11e1dea9f8b10e830964d8ce2bf479d230ffcf93) 在 2026-09-12 修复详情导航与布局。仓库包含测试和 CI 配置，但本次未运行其测试。
- 可用位置：本站的宝石条目结构、逐条参考来源、发布前内容与资源校验。
- 决策：参考“结构化内容先校验，再展示”的方法，自行实现适合本站的无额外依赖校验脚本；本轮不复制其代码或数据，也不迁入 VitePress/Vue 技术栈。分级、珠宝品牌等成人参考内容不直接进入儿童主流程，知识条目仍以地质机构、博物馆和 GIA 等资料逐条复核。

### 2. Crystal Renderer：保留为晶形教学图与模型导出的候选

- 仓库：[gemmology-dev/crystal-renderer](https://github.com/gemmology-dev/crystal-renderer)。[README](https://github.com/gemmology-dev/crystal-renderer/blob/main/README.md) 描述从晶形表达生成 SVG，并导出 STL、glTF；可调视角、面色和标签。
- 许可：[MIT](https://github.com/gemmology-dev/crystal-renderer/blob/main/LICENSE)。
- 维护证据：最近提交 [415fe26](https://github.com/gemmology-dev/crystal-renderer/commit/415fe26228b0950cbb037df0d9d8270ac7a18e02) 为 2026-05-13 的文档交叉链接；最近发布为 [v2.0.0](https://github.com/gemmology-dev/crystal-renderer/releases/tag/v2.0.0)，2026-02-16。最近一次提交是文档改动，不能据此声称核心渲染持续更新。
- 可用位置：以后为黄铁矿的立方体、石英的柱状晶形制作对照图，或导出亲子制作的模型。它主要表达宏观晶形，不能与原子排列模型混为一谈。
- 决策：暂不接入。现有静态站无需为此增加 Python、NumPy、Matplotlib 及晶形解析依赖；如果孩子确实需要旋转晶形或制作纸模，再用经过核实的少量模型做独立验证，优先离线生成资源，保持浏览器轻量。理想化几何必须标明“晶形示意”，不能当作真实标本照片或专业鉴定工具。

### 3. Mineral Database：只参考字段组织，不直接导入知识库

- 仓库：[gemmology-dev/mineral-database](https://github.com/gemmology-dev/mineral-database)。[README](https://github.com/gemmology-dev/mineral-database/blob/main/README.md) 描述 SQLite 矿物预设、晶形表达、物理及光学性质、颜色、处理和产地等字段。
- 许可：[MIT](https://github.com/gemmology-dev/mineral-database/blob/main/LICENSE)。仓库许可不等于其列出的所有上游资料和图片都能无条件复制；采用具体数据前仍需核对来源与再分发条件。
- 维护证据：最近提交 [43516f3](https://github.com/gemmology-dev/mineral-database/commit/43516f3067c055db65a384405b59351678b79088) 为 2026-05-13 的文档链接；[v2.3.0](https://github.com/gemmology-dev/mineral-database/releases/tag/v2.3.0) 发布于 2026-05-05，包含生成模型的改进。不同段落存在预设数量口径差异，不能直接把宣传数量当成已核实覆盖率。
- 质量抽查：README 将孔雀石列在非晶质类别，并将它包含在“无晶体结构”的表述中；但 [Cochise College 地质系的孔雀石资料](https://geology.cochise.edu/mineral-type/malachite/) 明确列为单斜晶系。这可能混淆集合体外观与内部晶体结构，足以阻止整库直接进入儿童科普内容。
- 决策：保留字段设计和查询方式作为技术参考，不直接导入数值、晶系或科普描述。若未来采用，必须固定版本，按条目记录证据、修正错误，并区分单晶、微晶集合体、岩石和非晶质材料。

## 网络数据源补充

[Crystallography Open Database（COD）](https://www.crystallography.net/cod/) 官方主页明确说明数据库及其中数据采用 CC0、奉献给公有领域，并提示使用者致谢原始结构数据作者；调研时仍有 2026-11-03 的新结构入库。它可作为未来“矿物内部怎样排列”课题的原子结构来源。原子结构数据与肉眼可见的宏观晶形不是同一层次，本轮不自动接入；若启用，需挑选并核实具体 CIF 条目及论文出处，转译为适龄的少量示意内容。

## 本轮实际采用的范围

本轮采用 GemAtlas 的结构化内容管理与发布前校验思路，在本站自行编写 `scripts/validate-content.mjs`，检查字段、唯一标识、问答答案范围、照片存在性和署名许可完整性。没有复制第三方代码、批量导入矿物数据库或增加前端依赖。自动校验能发现格式和资源错误，不能代替科学准确性的人工复核。

真实标本照片继续使用 `dist/assets/credits.json` 已逐张记录的许可与署名；科普事实继续保留每条知识卡的来源。公开可浏览、客户端开源、资料可下载、数据可再分发是不同条件，不能互相替代。后续每次引入项目或内容，先核对实际用途、许可证、维护证据、知识质量和适龄性，再决定是否接入。
