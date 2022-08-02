function buildNodeInfoTree(node, tree = {}) {
  let additionalInfo = "";
  if (node.name !== "") {
    additionalInfo += `(${node.name})`;
  }
  //   加入附加信息用于辨识MMD模型
  if (tree.type === "SkinnedMesh" && node.geometry.userData.MMD !== undefined) {
    additionalInfo += "(MMD)";
  }
  //   方便element plus接入
  tree.value = node.id;
  tree.label = `${node.type}${additionalInfo}`;
  tree.children = [];
  node.children.forEach((child) => {
    tree.children.push(buildNodeInfoTree(child));
  });
  return tree;
}
// 遍历一次，同时生成一个树结构和一个列表结构，算是一小点性能优化吧，方便UI那边提供两种选择模式
function buildNodeInfoTreeAndList(node, tree = {}, list = []) {
  let additionalInfo = "";
  if (node.name !== "") {
    additionalInfo += `(${node.name})`;
  }
  //   加入附加信息用于辨识MMD模型
  if (node.type === "SkinnedMesh" && node.geometry.userData.MMD !== undefined) {
    additionalInfo += "(MMD)";
  }
  //   方便element plus接入
  const nodeValue = node.id;
  const nodeLabel = `${node.type}${additionalInfo}`;
  tree.value = nodeValue;
  tree.label = nodeLabel;
  list.push({ label: nodeLabel, value: nodeValue });
  tree.children = [];
  node.children.forEach((child) => {
    const { tree: childInfo } = buildNodeInfoTreeAndList(child, {}, list);
    tree.children.push(childInfo);
  });
  return { tree, list };
}

export { buildNodeInfoTree, buildNodeInfoTreeAndList };
