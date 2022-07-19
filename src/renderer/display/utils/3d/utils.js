function buildNodeInfoTree(node, tree = {}) {
  let additionalInfo = "";
  if (node.name !== "") {
    additionalInfo += `(${node.name})`;
  }
  //   加入附加信息用于辨识MMD模型
  if (tree.type === "SkinnedMesh" && node.geometry.userData.MMD !== undefined) {
    additionalInfo += "(MMD)";
  }
  //   tree.type = node.type;
  //   tree.id = node.id;
  //   方便element ui接入
  tree.value = node.id;
  tree.label = `${node.type}${additionalInfo}`;
  tree.children = [];
  node.children.forEach((child) => {
    tree.children.push(buildNodeInfoTree(child));
  });
  return tree;
}

export { buildNodeInfoTree };
