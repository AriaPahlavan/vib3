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

### Run the animation loop
```typescript
vib3.animate()
```

### Add a mesh to the scene
```typescript
vib3.scene.add( mesh )
```

### Add animations
```typescript
vib3.addAnimation( (timeS, timeMS) => {
    mesh.rotation.x = timeS
    mesh.rotation.y = timeS
})
```

![cube](https://user-images.githubusercontent.com/8824819/152457160-b0ddb2e3-42ed-4950-ae0b-4aa06f4f942d.gif)

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

![scissor](https://user-images.githubusercontent.com/8824819/152457241-bbdbaf7e-48d5-4a30-a142-a355a65c4eb7.gif)


__TODOS__

- [ ] ...
