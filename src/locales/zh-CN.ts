/**
 * 简体中文语言包
 * 包含应用中所有需要翻译的文本
 */
export const zhCN = {
  // 通用文本
  common: {
    appName: 'MapMotion',
    appDescription: 'Web 地图动画工具',
    loading: '加载中...',
    saving: '保存中...',
    saved: '已保存',
    error: '错误',
    success: '成功',
    warning: '警告',
    info: '提示',
    confirm: '确认',
    cancel: '取消',
    delete: '删除',
    edit: '编辑',
    copy: '复制',
    paste: '粘贴',
    cut: '剪切',
    undo: '撤销',
    redo: '重做',
    save: '保存',
    saveAs: '另存为',
    export: '导出',
    import: '导入',
    preview: '预览',
    play: '播放',
    pause: '暂停',
    stop: '停止',
    reset: '重置',
    close: '关闭',
    open: '打开',
    new: '新建',
    search: '搜索',
    filter: '筛选',
    sort: '排序',
    settings: '设置',
    help: '帮助',
    about: '关于',
    yes: '是',
    no: '否',
    ok: '确定',
    apply: '应用',
    clear: '清除',
    selectAll: '全选',
    deselectAll: '取消全选',
    more: '更多',
    less: '收起',
    expand: '展开',
    collapse: '折叠',
    refresh: '刷新',
    retry: '重试',
    back: '返回',
    next: '下一步',
    previous: '上一步',
    finish: '完成',
    skip: '跳过',
    required: '必填',
    optional: '可选',
    default: '默认',
    custom: '自定义',
    none: '无',
    all: '全部',
    enabled: '已启用',
    disabled: '已禁用',
    on: '开',
    off: '关',
  },

  // 导航
  nav: {
    home: '首页',
    editor: '编辑器',
    projects: '我的项目',
    templates: '模板库',
    settings: '设置',
    help: '帮助',
    logout: '退出登录',
    login: '登录',
    signup: '注册',
  },

  // 侧边栏
  sidebar: {
    layers: '图层',
    layersDesc: '管理地图图层和要素',
    assets: '资源',
    assetsDesc: '管理项目资源文件',
    search: '搜索',
    searchDesc: '搜索地点和要素',
    styles: '样式',
    stylesDesc: '底图样式和主题配置',
    expand: '展开侧边栏',
    collapse: '收起侧边栏',
    addMarker: '添加标记点',
    addRoute: '添加路线',
    addLabel: '添加标签',
    addData: '导入数据',
  },

  // 资源
  assets: {
    icons: '图标库',
    images: '图片',
    data: '数据文件',
    searchPlaceholder: '搜索资源...',
    uploadHint: '点击或拖放上传',
    supportedFormats: '支持 PNG, JPG, SVG, CSV',
  },

  // 工具
  tools: {
    select: '选择工具',
    pan: '平移工具',
    marker: '标记点工具',
    route: '路线工具',
    measure: '测量工具',
    grid: '显示网格',
    showLabels: '显示标签',
    hideLabels: '隐藏标签',
    zoomIn: '放大',
    zoomOut: '缩小',
    resetBearing: '重置方位角',
    resetView: '重置视图',
    fullscreen: '全屏',
  },

  // 画布
  canvas: {
    time: '时间',
    pressEscToExit: '按 ESC 退出全屏',
  },

  // 首页
  home: {
    hero: {
      title: '轻松创建专业地图动画',
      subtitle: '无需 After Effects 经验，几分钟内制作出精美的地图动画视频',
      cta: '开始创作',
      secondary: '浏览模板',
    },
    features: {
      title: '强大功能，简单操作',
      mapStyles: {
        title: '丰富底图样式',
        description: '多种精美地图样式可选，支持自定义主题配色',
      },
      routeAnimation: {
        title: '路线动画',
        description: '自动生成路线并添加流畅的镜头跟随动画',
      },
      labels: {
        title: '智能标签',
        description: '自动避让布局，支持多种标签模板',
      },
      export: {
        title: '高质量导出',
        description: '支持 1080P/4K 视频导出，透明背景 PNG 序列',
      },
    },
  },

  // 编辑器
  editor: {
    // 工具
    tools: {
      select: '选择',
      pan: '平移',
      point: '点',
      line: '线',
      polygon: '多边形',
      label: '标签',
    },
    // 操作
    actions: {
      undo: '撤销',
      redo: '重做',
      zoomIn: '放大',
      zoomOut: '缩小',
      fitView: '适应视图',
    },
    // 视图
    view: {
      grid: '网格',
      rulers: '标尺',
      snap: '吸附',
    },
    // 播放
    playback: {
      play: '播放',
      pause: '暂停',
      stop: '停止',
      loop: '循环',
    },
    // 工具栏
    toolbar: {
      newProject: '新建项目',
      openProject: '打开项目',
      saveProject: '保存项目',
      exportVideo: '导出视频',
      undo: '撤销',
      redo: '重做',
      zoomIn: '放大',
      zoomOut: '缩小',
      fitView: '适应视图',
      resetView: '重置视图',
    },
    // 面板
    panels: {
      layers: '图层',
      properties: '属性',
      timeline: '时间线',
      styles: '样式',
      assets: '资源',
    },
    // 图层
    layers: {
      addLayer: '添加图层',
      removeLayer: '删除图层',
      duplicateLayer: '复制图层',
      renameLayer: '重命名图层',
      lockLayer: '锁定图层',
      unlockLayer: '解锁图层',
      showLayer: '显示图层',
      hideLayer: '隐藏图层',
      layerTypes: {
        camera: '镜头',
        path: '路径',
        label: '标签',
        marker: '标记',
        polygon: '多边形',
        heatmap: '热力图',
        terrain: '地形',
        building: '建筑',
      },
    },
    // 时间线
    timeline: {
      addItem: '添加条目',
      removeItem: '删除条目',
      duration: '时长',
      startTime: '开始时间',
      endTime: '结束时间',
      easing: '缓动',
      playhead: '播放头',
      zoom: '缩放',
      snap: '吸附',
      loop: '循环',
    },
    // 属性面板
    properties: {
      position: '位置',
      rotation: '旋转',
      scale: '缩放',
      opacity: '透明度',
      color: '颜色',
      size: '大小',
      font: '字体',
      text: '文本',
      icon: '图标',
      animation: '动画',
    },
    // 样式
    styles: {
      baseMap: '底图样式',
      theme: '主题',
      colors: '配色',
      fonts: '字体',
      customStyle: '自定义样式',
      saveStyle: '保存样式',
      loadStyle: '加载样式',
    },
    // 导出
    export: {
      title: '导出设置',
      format: '格式',
      resolution: '分辨率',
      frameRate: '帧率',
      quality: '质量',
      startExport: '开始导出',
      cancelExport: '取消导出',
      progress: '导出进度',
      complete: '导出完成',
      failed: '导出失败',
      downloadFile: '下载文件',
      presets: {
        social1080p: '社媒 1080p',
        vertical9x16: '竖屏 9:16',
        highQuality4k: '高清 4K',
        pngSequence: 'PNG 序列',
        transparent: '透明背景',
      },
    },
    // 搜索
    search: {
      placeholder: '搜索地点...',
      noResults: '未找到结果',
      searching: '搜索中...',
      recentSearches: '最近搜索',
      clearHistory: '清除历史',
    },
    // 路线
    route: {
      title: '路线设置',
      origin: '起点',
      destination: '终点',
      waypoints: '途经点',
      addWaypoint: '添加途经点',
      removeWaypoint: '删除途经点',
      travelMode: '出行方式',
      modes: {
        driving: '驾车',
        walking: '步行',
        cycling: '骑行',
        flight: '航线',
        greatCircle: '大圆航线',
      },
      generateRoute: '生成路线',
      clearRoute: '清除路线',
    },
    // 镜头
    camera: {
      title: '镜头设置',
      presets: {
        dollyIn: '推进',
        dollyOut: '拉远',
        panLeft: '左移',
        panRight: '右移',
        orbit: '环绕',
        tilt: '俯仰',
        zoom: '缩放',
        flyTo: '飞向',
        followPath: '跟随路径',
      },
      settings: {
        duration: '持续时间',
        easing: '缓动曲线',
        strength: '强度',
        pitch: '俯仰角',
        bearing: '方位角',
        zoom: '缩放级别',
      },
    },
    // 标签
    label: {
      title: '标签设置',
      templates: {
        city: '城市标签',
        poi: 'POI 标签',
        annotation: '注释标签',
        callout: '标注框',
      },
      settings: {
        text: '文本内容',
        fontSize: '字号',
        fontWeight: '字重',
        textColor: '文字颜色',
        backgroundColor: '背景颜色',
        borderColor: '边框颜色',
        padding: '内边距',
        borderRadius: '圆角',
        showIcon: '显示图标',
        iconPosition: '图标位置',
      },
      collision: {
        title: '碰撞检测',
        enabled: '启用避让',
        priority: '优先级',
        allowOverlap: '允许重叠',
      },
    },
    // 数据
    data: {
      title: '数据导入',
      import: '导入数据',
      supportedFormats: '支持格式：CSV、TSV、GeoJSON',
      fieldMapping: '字段映射',
      preview: '数据预览',
      rows: '行',
      columns: '列',
      invalidData: '数据格式错误',
      mapping: {
        name: '名称字段',
        latitude: '纬度字段',
        longitude: '经度字段',
        value: '数值字段',
      },
      visualization: {
        title: '可视化设置',
        type: '可视化类型',
        types: {
          point: '散点',
          heatmap: '热力图',
          cluster: '聚合',
          line: '连线',
          polygon: '区域',
        },
        colorScale: '配色方案',
        sizeScale: '大小映射',
        minValue: '最小值',
        maxValue: '最大值',
      },
    },
  },

  // 项目
  project: {
    title: '项目',
    newProject: '新建项目',
    openProject: '打开项目',
    saveProject: '保存项目',
    deleteProject: '删除项目',
    duplicateProject: '复制项目',
    shareProject: '分享项目',
    projectName: '项目名称',
    lastModified: '最后修改',
    created: '创建时间',
    untitled: '未命名项目',
    confirmDelete: '确定要删除这个项目吗？此操作不可撤销。',
    autoSaved: '自动保存',
    version: '版本',
    snapshot: '快照',
    createSnapshot: '创建快照',
    restoreSnapshot: '恢复快照',
  },

  // 模板
  template: {
    title: '模板',
    browse: '浏览模板',
    useTemplate: '使用模板',
    previewTemplate: '预览模板',
    categories: {
      all: '全部',
      route: '路线动画',
      city: '城市介绍',
      event: '事件追踪',
      data: '数据可视化',
      brand: '品牌宣传',
    },
  },

  // 设置
  settings: {
    title: '设置',
    general: {
      title: '通用设置',
      language: '语言',
      theme: '主题',
      themes: {
        light: '浅色',
        dark: '深色',
        system: '跟随系统',
      },
    },
    editor: {
      title: '编辑器设置',
      autoSave: '自动保存',
      autoSaveInterval: '自动保存间隔',
      snapToGrid: '吸附到网格',
      showRulers: '显示标尺',
      defaultDuration: '默认时长',
    },
    export: {
      title: '导出设置',
      defaultFormat: '默认格式',
      defaultResolution: '默认分辨率',
      includeWatermark: '包含水印',
      includeAttribution: '包含版权信息',
    },
    shortcuts: {
      title: '快捷键',
      customize: '自定义快捷键',
      reset: '重置为默认',
    },
    account: {
      title: '账户设置',
      profile: '个人资料',
      email: '邮箱',
      password: '密码',
      changePassword: '修改密码',
      deleteAccount: '删除账户',
    },
  },

  // 错误消息
  errors: {
    generic: '出了点问题，请重试',
    network: '网络连接失败，请检查网络',
    notFound: '找不到请求的资源',
    unauthorized: '未授权访问',
    forbidden: '没有权限执行此操作',
    validation: '输入数据无效',
    fileTooBig: '文件过大',
    invalidFormat: '格式不支持',
    exportFailed: '导出失败',
    saveFailed: '保存失败',
    loadFailed: '加载失败',
    searchFailed: '搜索失败',
    routeFailed: '路线生成失败',
  },

  // 成功消息
  success: {
    saved: '保存成功',
    exported: '导出成功',
    deleted: '删除成功',
    copied: '复制成功',
    imported: '导入成功',
    updated: '更新成功',
  },

  // 确认对话框
  confirm: {
    unsavedChanges: {
      title: '未保存的更改',
      message: '您有未保存的更改，确定要离开吗？',
      save: '保存并离开',
      discard: '放弃更改',
      cancel: '取消',
    },
    deleteItem: {
      title: '确认删除',
      message: '确定要删除此项目吗？此操作不可撤销。',
    },
  },

  // 时间单位
  time: {
    seconds: '秒',
    minutes: '分钟',
    hours: '小时',
    days: '天',
    milliseconds: '毫秒',
    fps: '帧/秒',
  },

  // 尺寸单位
  units: {
    pixels: '像素',
    percent: '百分比',
    degrees: '度',
    meters: '米',
    kilometers: '公里',
  },

  // 时间线面板
  timeline: {
    title: '时间线',
    tracks: '轨道',
    addTrack: '添加轨道',
    play: '播放',
    pause: '暂停',
    stop: '停止',
    skipBack: '跳到开头',
    skipForward: '跳到结尾',
    zoomIn: '放大时间线',
    zoomOut: '缩小时间线',
    expand: '展开时间线',
    collapse: '收起时间线',
    camera: '镜头动画',
    path: '路径动画',
    label: '标签动画',
    data: '数据动画',
    overlay: '覆盖层',
    hide: '隐藏轨道',
    show: '显示轨道',
    lock: '锁定轨道',
    unlock: '解锁轨道',
  },

  // 属性面板
  properties: {
    title: '属性',
    expand: '展开属性面板',
    collapse: '收起属性面板',
    itemsSelected: '个项目已选中',
    sceneProperties: '场景属性',
    scene: '场景',
    sceneName: '场景名称',
    duration: '时长',
    camera: '相机',
    zoom: '缩放级别',
    pitch: '俯仰角',
    bearing: '方位角',
    transform: '位置',
    longitude: '经度',
    latitude: '纬度',
    quickActions: '快捷操作',
    lock: '锁定',
    resetToDefault: '重置为默认值',
  },

  // 通用
  items: '个项目',
  add: '添加',
  
  // 快捷操作栏
  quickActions: {
    title: '快速创建',
    create: '创建',
    open: '打开快捷操作',
    hint: '按快捷键可快速访问',
    addRoute: '添加路线',
    addRouteDesc: '创建带动画的路线',
    addMarker: '添加标记',
    addMarkerDesc: '在地图上放置标记点',
    addLabel: '添加标签',
    addLabelDesc: '添加文字注释',
    addCamera: '镜头动画',
    addCameraDesc: '添加镜头移动动画',
    importData: '导入数据',
    importDataDesc: '导入 CSV/GeoJSON 数据',
    useTemplate: '使用模板',
    useTemplateDesc: '从模板开始创作',
  },
  
  // 欢迎引导
  welcome: {
    title: '欢迎使用 MapMotion',
    subtitle: '几分钟内创建精美的地图动画。选择您想要的开始方式：',
    createRoute: '创建路线动画',
    createRouteDesc: '绘制路径并添加流畅的镜头跟随动画',
    addMarker: '添加位置标记',
    addMarkerDesc: '在地图上标注兴趣点',
    createCamera: '镜头动画',
    createCameraDesc: '创建电影级镜头运动效果',
    importData: '导入您的数据',
    importDataDesc: '可视化您的 CSV 或 GeoJSON 数据',
    browseTemplates: '浏览模板',
    watchTutorial: '观看教程',
    dontShowAgain: '不再显示',
    tip: '提示：按 ? 查看所有快捷键',
  },
  
  // 头部
  header: {
    unsavedChanges: '有未保存的更改',
  },
} as const;

/**
 * 翻译键类型
 * 用于类型安全的翻译键访问
 */
export type TranslationKey = typeof zhCN;
