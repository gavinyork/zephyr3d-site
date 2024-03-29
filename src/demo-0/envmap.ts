import type { Texture2D, TextureCube } from "@zephyr3d/device";
import { Application, AssetManager, Scene, panoramaToCubemap, prefilterCubemap } from "@zephyr3d/scene";

type EnvMapInfo = {
  path: string,
  maps?: Promise<TextureCube[]>,
};

export class EnvMaps {
  private _envMaps: Record<string, EnvMapInfo>;
  private _assetManager: AssetManager;
  private _assetManagerEx: AssetManager;
  private _currentId: string;
  constructor(){
    this._envMaps = {
      'tower': {
        path: 'assets/images/environments/tower.hdr',
      },
      'doge2': {
        path: 'assets/images/environments/doge2.hdr',
      },
      'Street night': {
        path: 'assets/images/environments/street_night.hdr',
      },
      'forest': {
        path: 'assets/images/environments/forest.hdr',
      }
    };
    this._assetManager = new AssetManager();
    this._assetManagerEx = new AssetManager();
    this._currentId = '';
    for (const k in this._envMaps) {
      this._envMaps[k].maps = this.loadEnvMap(this._envMaps[k].path, this._assetManager);
    }
  }
  getIdList(): string[] {
    return Object.keys(this._envMaps);
  }
  getCurrentId(): string {
    return this._currentId;
  }
  async loadEnvMap(path: string, assetManager: AssetManager): Promise<TextureCube[]> {
    const maps = this.createMaps();
    try {
      const panorama = await assetManager.fetchTexture<Texture2D>(path);
      panoramaToCubemap(panorama, maps[0]);
      prefilterCubemap(maps[0], 'ggx', maps[1]);
      prefilterCubemap(maps[0], 'lambertian', maps[2]);
    } catch(err) {
      console.error(err);
    }
    return maps;
  }
  createMaps(): TextureCube[] {
    return [
      Application.instance.device.createCubeTexture('rgba16f', 512),
      Application.instance.device.createCubeTexture('rgba16f', 256),
      Application.instance.device.createCubeTexture('rgba16f', 64, {
        samplerOptions: { mipFilter: 'none' }
      })
    ];
  }
  async selectByPath(path: string, scene: Scene, urlResolver: (url: string) => string) {
    this._assetManagerEx.purgeCache();
    this._assetManagerEx.httpRequest.urlResolver = urlResolver;
    const maps = await this.loadEnvMap(path, this._assetManagerEx);
    this._currentId = '';
    scene.env.sky.skyType = 'skybox';
    scene.env.sky.skyboxTexture = maps[0];
    scene.env.sky.fogType = 'none';
    scene.env.light.type = 'ibl';
    scene.env.light.radianceMap = maps[1];
    scene.env.light.irradianceMap = maps[2];
  }
  async selectById(id: string, scene: Scene){
    const info = this._envMaps[id];
    if (!info) {
      console.error(`Environment map id not found: ${id}`);
      return;
    }
    const maps = await info.maps;
    this._currentId = id;
    scene.env.sky.skyType = 'skybox';
    scene.env.sky.skyboxTexture = maps[0];
    scene.env.sky.fogType = 'none';
    scene.env.light.radianceMap = maps[1];
    scene.env.light.irradianceMap = maps[2];
  }
}
