/* Five routes, with an evidence case unlocked after all ten stations in a route. */
window.GemIslandRoutes = [
  {
    id:'quartz-trail', title:'晶簇森林', topic:'认识同一家族的不同面孔', mark:'🌲', tint:'#edf6df',
    ids:'amethyst quartz rose-quartz agate citrine smoky-quartz ametrine carnelian chrysoprase jasper'.split(' '),
    caseTitle:'是谁把家族卡弄乱了？',
    evidence:['紫水晶：主要成分 SiO₂，莫氏硬度 7。','烟晶：主要成分 SiO₂，莫氏硬度 7。','玛瑙：主要成分 SiO₂，由非常细小的晶粒组成。','祖母绿：绿柱石，主要成分 Be₃Al₂Si₆O₁₈。'],
    questions:[
      ['按矿物家族整理展柜，哪张卡应放到另一个柜子？','祖母绿','玛瑙','烟晶','祖母绿属于绿柱石家族。玛瑙和烟晶外观不同，都属于石英家族。'],
      ['有人说玛瑙看不到大晶面，所以内部没有晶粒。证据卡支持什么？','它有肉眼难以分辨的小晶粒','它内部只有空气','它只能是人造玻璃','晶粒太小看不清，和没有晶粒是两回事。']
    ]
  },
  {
    id:'color-trail', title:'彩虹山脊', topic:'识破颜色造成的误会', mark:'🌈', tint:'#faebdf',
    ids:'aquamarine emerald morganite heliodor ruby sapphire spinel garnet tourmaline peridot'.split(' '),
    caseTitle:'双生红石谜案',
    evidence:['A 红色：Al₂O₃，硬度 9。','B 红色：MgAl₂O₄，硬度 8。','C 蓝色：Al₂O₃，硬度 9。'],
    questions:[
      ['三份记录里，哪两块可以先归入同一家族？','A 和 C','A 和 B','B 和 C','A 与 C 的主要成分和硬度相同，符合刚玉家族。'],
      ['为了防止以后再认错，展签里应该保留什么？','颜色、成分和硬度的记录','只留下最容易记的颜色','只留下哪颗更亮','颜色可以帮我们提出猜想，成分和硬度等其他证据能检验猜想。']
    ]
  },
  {
    id:'shape-trail', title:'纹理矿谷', topic:'看懂晶面、条纹和伴生矿物', mark:'⛰️', tint:'#e6f3ee',
    ids:'fluorite pyrite malachite rhodochrosite rhodonite azurite turquoise lapis-lazuli sodalite amazonite'.split(' '),
    caseTitle:'蓝石里的金色线索',
    evidence:['青金石是由多种矿物组成的岩石。','一块蓝色样品上有白斑和金色小点。','实验室报告：金点主要成分为 FeS₂。','黄铁矿主要成分为 FeS₂。'],
    questions:[
      ['哪两条证据一起最能支持“金点可能是黄铁矿”？','金点与黄铁矿的成分记录','样品是蓝色，金点是金色','样品有白斑，旁边也有蓝色','成分相符比颜色相似更能支持这个推断。'],
      ['给整块样品写展签，怎样描述更贴近证据？','不同矿物可以在一块岩石里共存','看到了金点，整块就是黄金','这块岩石只有一种矿物','岩石可以由不同矿物组成。外观不同的区域可以分别记录。']
    ]
  },
  {
    id:'light-trail', title:'追光海湾', topic:'用公平实验区分光学现象', mark:'🔦', tint:'#eee8f8',
    ids:'opal moonstone labradorite sunstone alexandrite chrysoberyl-cat-eye iolite tanzanite kunzite zircon'.split(' '),
    caseTitle:'一盏灯的秘密',
    evidence:['A 在同一灯光下，转动后蓝色亮片出现又消失。','B 保持角度，换光源后从绿色变成红色。','C 圆弧面上的一道亮线跟着光源移动。'],
    questions:[
      ['哪条记录专门比较了光源对颜色的影响？','B：角度固定，只换光源','A：光源固定，只转动宝石','C：观察一道亮线的位置','B 控制了观察角度，所以可把颜色差异和光源联系起来。'],
      ['如果要检验 A 的亮片是否真的和角度有关，下一步怎么做？','固定光源，多次转回同一个角度并记录','每次同时更换光源和石头','只看一次就宣布所有石头都会闪','回到同一角度重做观察，有助于判断现象能否重复。']
    ]
  },
  {
    id:'maker-trail', title:'造物高原', topic:'为工具、饰件和展柜选材料', mark:'🛠️', tint:'#fff0ce',
    ids:'diamond topaz jadeite nephrite amber pearl coral obsidian hematite kyanite'.split(' '),
    caseTitle:'博物馆的材料订单',
    evidence:['钻石：硬度 10，可用于工业磨削。','珍珠：硬度约 2.5，表面有柔和光泽。','软玉：硬度 6–6.5，细纤维交织使其韧性较好。','托帕石：硬度 8，有解理，受撞可能裂开。'],
    questions:[
      ['需要磨削硬材料的工具，哪张材料卡最能支持选择？','钻石：硬度高，已有磨削应用','珍珠：外形圆润','软玉：适合雕刻','工具需要硬质磨料。金刚石颗粒可用于磨削。'],
      ['设计师挑选一件细长雕饰的材料，还该重视什么？','材料的韧性和内部结构','只按硬度数字从大到小挑选','只挑看起来最闪的材料','耐刮与抗断裂是不同性质。细长设计需要考虑材料是否容易折断。']
    ]
  }
];
