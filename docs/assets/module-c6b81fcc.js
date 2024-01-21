console.log('Loading module "Kram_1409b6d4_TSWorkbook"');
function Program({ connectStore, initializeStore }) {
  return {};
}
function mount(mountpoint, initial) {
  let Store = {
    root: Object.assign({}, initial)
  };
  const connectStore = (path = ["root"]) => {
    let root = Store;
    path.forEach((key) => root = root[key]);
    return {
      root,
      get: (key) => root[key],
      set: (key, value) => root[key] = value,
      keys: () => Object.keys(root)
    };
  };
  const program = Program({ connectStore });
  return (n, container) => {
    program[n - 1].call(container);
  };
}

export { Program, mount };
