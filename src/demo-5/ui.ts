import { GUI } from 'lil-gui';
import { getDevice } from '@zephyr3d/scene';

interface GUIParams {
  deviceType: string;
  numVertices: number;
  numInstances: number;
  numTriangles: number;
  FPS: string;
}

export class Panel {
  private readonly _deviceList: string[];
  private readonly _params: GUIParams;
  private readonly _gui: GUI;
  constructor(instanceCount: number, vertexCount: number, faceCount: number) {
    this._deviceList = ['WebGL2', 'WebGPU'];
    this._params = {
      deviceType:
        this._deviceList[this._deviceList.findIndex((val) => val.toLowerCase() === getDevice().type)],
      numInstances: instanceCount,
      numTriangles: vertexCount,
      numVertices: faceCount,
      FPS: ''
    };
    this._gui = new GUI({ container: document.body });
    this.create();
  }
  create() {
    const systemSettings = this._gui.addFolder('System');
    systemSettings
      .add(this._params, 'deviceType', this._deviceList)
      .name('Select device')
      .onChange((value) => {
        const url = new URL(window.location.href);
        url.searchParams.set('dev', value.toLowerCase());
        window.location.href = url.href;
      });
    const stats = this._gui.addFolder('Stats');
    stats.add(this._params, 'numVertices').name('Vertex count').disable(true);
    stats.add(this._params, 'numInstances').name('Instance count').disable(true);
    stats.add(this._params, 'numTriangles').name('Face count').disable(true);
    stats.add(this._params, 'FPS').name('FPS').disable(true).listen();
    setInterval(() => {
      this._params.FPS = getDevice().frameInfo.FPS.toFixed(2);
    }, 1000);
  }
}
