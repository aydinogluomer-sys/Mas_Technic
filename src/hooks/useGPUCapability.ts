export type GPUCapability = 'none' | 'low' | 'high';

let _cached: GPUCapability | null = null;

export function useGPUCapability(): GPUCapability {
  if (_cached !== null) return _cached;

  try {
    const canvas = document.createElement('canvas');
    const gl =
      (canvas.getContext('webgl2') as WebGL2RenderingContext | null) ??
      (canvas.getContext('webgl') as WebGLRenderingContext | null);

    if (!gl) {
      _cached = 'none';
      return _cached;
    }

    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    if (ext) {
      const renderer = gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) as string;
      if (/swiftshader|llvmpipe|mesa/i.test(renderer)) {
        _cached = 'low';
        return _cached;
      }
    }

    _cached = 'high';
    return _cached;
  } catch {
    _cached = 'none';
    return _cached;
  }
}
