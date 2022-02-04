# VIB3 User Guide

## Quick setup 🚀

### Install VIB3
```
npm install vib3`
```
### Initialize a renderer
```typescript
const vib3 = Vib3.init()
```

> NOTE: you can pass your own canvas or other parameters: 
> `Vib3.init({ canvas })` 

### Add a camera
```typescript
vib3.withCameras( camera )
```

### Add a mesh to the scene
```typescript
vib3.scene.add( mesh )
```

### Run the animation loop
```typescript
vib3.animate()
```

### Add animations
```typescript
vib3.addAnimation( (timeS, timeMS) => {
    mesh.rotation.x = timeS
    mesh.rotation.y = timeS
})
```

### Add fog
```typescript
vib3.enableFog(0xF2F8F7)
```

### Add scissor view for troubleshooting
```typescript
vib32
      .withCameras( camera )
      .withCameraHelpers( new CameraHelper(camera) )
      .enableSplitView()
```

__TODOS__
-[ ] ...
