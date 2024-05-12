// 创建UI面板
function createUI(thisObj) {
    var panel = (thisObj instanceof Panel) ? thisObj : new Window("palette", "Save Current Frame", undefined, {resizeable: true});
    panel.orientation = "column";
    panel.alignChildren = ["fill", "top"];
    panel.spacing = 10;
    panel.margins = 16;

    var selectFolderButton = panel.add("button", undefined, "Save to...");
    var nameSourceDropdown = panel.add("dropdownlist", undefined, ["Proj Name", "Active Comp Name", "Custom..."]);
    nameSourceDropdown.selection = 0; // 默认选择第一个选项
    var customNameInput = panel.add("edittext", undefined, "Custom Name");
    customNameInput.text = "Custom Name";
    var includeGuideLayersCheckbox = panel.add("checkbox", undefined, "Include Guide Layers");
    includeGuideLayersCheckbox.value = true;
    var saveButton = panel.add("button", undefined, "Save");

    var outputPath = null;

    selectFolderButton.onClick = function() {
        outputPath = Folder.selectDialog("Select Output Folder");
        if (outputPath) {
            alert("Selected path: " + outputPath.fsName);
        } else {
            alert("Output folder not selected");
        }
    };

    saveButton.onClick = function() {
        if (outputPath) {
            saveFrameToPng(outputPath, customNameInput.text, nameSourceDropdown.selection.index, includeGuideLayersCheckbox.value);
        } else {
            alert("Please select output folder first.");
        }
    };

    // 显示UI面板
    if (panel instanceof Window) {
        panel.show();
    } else {
        panel.layout.layout(true);
        panel.layout.resize();
    }
}

// 格式化日期为YYMMDDHHmm
function formatDate(date) {
    function pad(num) { return ("0"+num).slice(-2); }
    var year = date.getFullYear().toString(),
        month = pad(date.getMonth()+1),
        day = pad(date.getDate()),
        hour = pad(date.getHours()),
        minute = pad(date.getMinutes()),
        second = pad(date.getSeconds());
    return year + month + day + "_" + hour + minute + second;
}

// 保存当前帧为PNG
function saveFrameToPng(outputPath, customName, nameSource, includeGuideLayers) {
    var activeItem = app.project.activeItem;
    if (!activeItem || !(activeItem instanceof CompItem)) {
        alert("No active composition found");
        return;
    }

    // 获取当前时间
    var currentTime = formatDate(new Date());

    // 获取当前帧
    var currentFrame = Math.round(activeItem.time * activeItem.frameRate);

    // 参考图层处理
    var guideLayers = [];
    if (includeGuideLayers) {
        for (var i = 1; i <= activeItem.numLayers; i++) {
            var layer = activeItem.layer(i);
            if (layer.guideLayer) {
                guideLayers.push(layer);
                layer.guideLayer = false; // 临时关闭参考图层属性
            }
        }
    }

    // 确定名称来源
    var name = "";
    switch (nameSource) {
        case 0: // 工程文件名
            name = app.project.file ? app.project.file.name.replace(/\.aep$/, '') : "Untitled";
            break;
        case 1: // 当前合成名
            name = activeItem.name;
            break;
        case 2: // 自定义名称
            name = customName;
            break;
    }


    // 设置输出文件名
    var outputFileName = outputPath.fsName + "/" + name + "_" + currentTime + "_frame" + currentFrame + ".png";

    // 保存PNG
    try {
        activeItem.saveFrameToPng(currentFrame, new File(outputFileName));
        // 显示保存结果
        alert("Saved: " + outputFileName);
    } catch (e) {
        alert("Failed to saving: " + e.toString());
    } finally {
        // 恢复参考图层属性
        if (includeGuideLayers) {
            for (var j = 0; j < guideLayers.length; j++) {
                guideLayers[j].guideLayer = true;
            }
        }
    }
}

// 创建并显示UI
createUI(this);
