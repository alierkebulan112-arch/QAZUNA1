import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import type { Model } from './data'

const gold = () => new THREE.MeshStandardMaterial({ color: 0xd4af5f, metalness: 0.9, roughness: 0.28 })

function lathe(points: [number, number][], material: THREE.Material) {
  const geo = new THREE.LatheGeometry(points.map(([x, y]) => new THREE.Vector2(x, y)), 64)
  return new THREE.Mesh(geo, material)
}

function torus(radius: number, tube: number, y: number, material: THREE.Material) {
  const mesh = new THREE.Mesh(new THREE.TorusGeometry(radius, tube, 16, 64), material)
  mesh.rotation.x = Math.PI / 2
  mesh.position.y = y
  return mesh
}

// Стилизованные процедурные модели для изделий, у которых пока нет настоящего 3D-файла.
function buildProcedural(shape: 'hat' | 'robe', accent: string) {
  const group = new THREE.Group()
  const color = new THREE.Color(accent)
  if (shape === 'hat') {
    const fur = new THREE.MeshStandardMaterial({ color: 0x3b2a1f, roughness: 1 })
    const velvet = new THREE.MeshStandardMaterial({ color: color, roughness: 0.75, metalness: 0.05 })
    group.add(lathe([[0.6, 0], [0.67, 0.05], [0.7, 0.18], [0.67, 0.3], [0.61, 0.34]], fur))
    group.add(lathe([[0.6, 0.33], [0.56, 0.5], [0.44, 0.68], [0.24, 0.8], [0.0, 0.84]], velvet))
    group.add(torus(0.62, 0.022, 0.35, gold()))
    group.add(torus(0.5, 0.012, 0.56, gold()))
    const knob = new THREE.Mesh(new THREE.SphereGeometry(0.05, 24, 24), gold())
    knob.position.y = 0.86
    group.add(knob)
  } else {
    const velvet = new THREE.MeshStandardMaterial({ color: color, roughness: 0.6, metalness: 0.2 })
    group.add(lathe([[0.12, 1.52], [0.2, 1.46], [0.38, 1.36], [0.36, 1.1], [0.33, 0.85], [0.45, 0.4], [0.62, 0]], velvet))
    ;[-1, 1].forEach((s) => {
      const sleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.14, 0.85, 24), velvet)
      sleeve.position.set(s * 0.66, 1.08, 0)
      sleeve.rotation.z = s * 1.15
      group.add(sleeve)
      const cuff = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.02, 12, 32), gold())
      cuff.position.set(s * 1.01, 0.77, 0)
      cuff.rotation.z = s * 1.15 + Math.PI / 2
      cuff.rotation.y = Math.PI / 2
      group.add(cuff)
    })
    group.add(torus(0.62, 0.025, 0.02, gold()))
    group.add(torus(0.4, 0.018, 1.33, gold()))
  }
  return group
}

type Props = {
  model: Model
  accent: string
  rotation: number
  replay?: number
  /** true болса render тоқтатылады (модель жасырын кезде GPU үнемдеу) */
  paused?: boolean
  loadingText: string
  failText: string
  onSnap?: (dataUrl: string) => void
}

export default function ModelViewer({ model, accent, rotation, replay = 0, paused = false, loadingText, failText, onSnap }: Props) {
  const mountRef = useRef<HTMLDivElement>(null)
  const modelRef = useRef<THREE.Object3D | null>(null)
  const rotationRef = useRef(rotation)
  const pausedRef = useRef(paused)
  const snapRef = useRef(onSnap)
  const introStart = useRef<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [failed, setFailed] = useState(false)
  const [progress, setProgress] = useState(0)

  snapRef.current = onSnap
  rotationRef.current = rotation
  pausedRef.current = paused

  useEffect(() => { introStart.current = performance.now() }, [replay])

  const key = model.kind === 'proc' ? `proc:${model.shape}:${accent}` : model.url

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return
    setLoading(true)
    setFailed(false)
    setProgress(0)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(32, 1, 0.01, 100)
    camera.position.set(0, 0.15, 5.2)
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.25
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    mount.appendChild(renderer.domElement)

    scene.add(new THREE.HemisphereLight(0xfff1d5, 0x1b2631, 2.6))
    const keyLight = new THREE.DirectionalLight(0xffe1aa, 4.4)
    keyLight.position.set(3, 5, 4)
    keyLight.castShadow = true
    scene.add(keyLight)
    const rimLight = new THREE.DirectionalLight(0x5ca7c7, 3.2)
    rimLight.position.set(-4, 2, -3)
    scene.add(rimLight)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.enablePan = false
    controls.enableZoom = true
    controls.autoRotate = true
    controls.autoRotateSpeed = 1.15
    controls.minDistance = 3
    controls.maxDistance = 7
    controls.minPolarAngle = Math.PI * 0.28
    controls.maxPolarAngle = Math.PI * 0.7
    const pause = () => { controls.autoRotate = false }
    const resume = () => { controls.autoRotate = true }
    controls.addEventListener('start', pause)
    controls.addEventListener('end', resume)

    let disposed = false
    const resize = () => {
      const { clientWidth, clientHeight } = mount
      if (!clientWidth || !clientHeight) return
      renderer.setSize(clientWidth, clientHeight, false)
      camera.aspect = clientWidth / clientHeight
      camera.updateProjectionMatrix()
    }

    const prepare = (obj: THREE.Object3D) => {
      if (disposed) return
      const box = new THREE.Box3().setFromObject(obj)
      const size = box.getSize(new THREE.Vector3())
      const center = box.getCenter(new THREE.Vector3())
      // подгоняем и по высоте, и по ширине: низкие широкие вещи (тақия) раньше выходили за кадр
      const scale = Math.min(3.35 / Math.max(size.y, 0.001), 2.7 / Math.max(Math.hypot(size.x, size.z), 0.001))
      obj.scale.multiplyScalar(scale)
      obj.position.set(-center.x * scale, -center.y * scale, -center.z * scale)
      obj.rotation.y = THREE.MathUtils.degToRad(rotationRef.current)
      obj.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true
          child.receiveShadow = true
          const mats = Array.isArray(child.material) ? child.material : [child.material]
          mats.forEach((m: THREE.Material) => { m.side = THREE.DoubleSide })
        }
      })
      modelRef.current = obj
      scene.add(obj)
      introStart.current = performance.now()
      setLoading(false)

      if (snapRef.current) {
        try {
          resize()
          controls.autoRotate = false
          renderer.render(scene, camera)
          const small = document.createElement('canvas')
          small.width = 160
          small.height = 160
          const ctx = small.getContext('2d')
          const src = renderer.domElement
          const side = Math.min(src.width, src.height)
          ctx?.drawImage(src, (src.width - side) / 2, (src.height - side) / 2, side, side, 0, 0, 160, 160)
          snapRef.current(small.toDataURL('image/png'))
          controls.autoRotate = true
        } catch { /* снимок не обязателен */ }
      }
    }

    const onError = () => {
      if (!disposed) {
        setLoading(false)
        setFailed(true)
      }
    }
    const onProgress = (e: ProgressEvent) => {
      if (!disposed && e.total > 0) setProgress(Math.round((e.loaded / e.total) * 100))
    }

    if (model.kind === 'proc') prepare(buildProcedural(model.shape, accent))
    else if (model.kind === 'glb') new GLTFLoader().load(model.url, (r) => prepare(r.scene), onProgress, onError)
    else new FBXLoader().load(model.url, prepare, onProgress, onError)

    const observer = new ResizeObserver(resize)
    observer.observe(mount)
    resize()

    let frame = 0
    // Кіріспе: камера кестеге жақындап тұрады, сосын алыстап, киім 360° айналады
    const INTRO_MS = 6500
    const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2)
    const animate = () => {
      frame = requestAnimationFrame(animate)
      if (pausedRef.current) return
      const obj = modelRef.current
      const start = introStart.current
      let angle = 0
      if (start !== null) {
        const p = Math.min((performance.now() - start) / INTRO_MS, 1)
        const e = ease(p)
        const dist = THREE.MathUtils.lerp(2.1, 5.2, Math.min(e * 1.6, 1))
        const ty = THREE.MathUtils.lerp(0.55, 0, Math.min(e * 1.6, 1))
        controls.target.set(0, ty, 0)
        camera.position.set(0, ty + 0.15, dist)
        angle = e * Math.PI * 2
        controls.autoRotate = false
        if (p >= 1) { introStart.current = null; controls.autoRotate = true }
      }
      if (obj) obj.rotation.y = THREE.MathUtils.degToRad(rotationRef.current) + angle
      controls.update()
      renderer.render(scene, camera)
    }
    animate()

    return () => {
      disposed = true
      cancelAnimationFrame(frame)
      observer.disconnect()
      controls.removeEventListener('start', pause)
      controls.removeEventListener('end', resume)
      controls.dispose()
      scene.traverse((object) => {
        if (!(object instanceof THREE.Mesh)) return
        object.geometry?.dispose()
        const mats = Array.isArray(object.material) ? object.material : [object.material]
        mats.forEach((m: THREE.Material) => m.dispose())
      })
      renderer.dispose()
      renderer.domElement.remove()
      modelRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  return (
    <div className="three-model" ref={mountRef}>
      {loading && (
        <div className="model-loading">
          <i />
          <span>{loadingText}{progress > 0 ? ` · ${progress}%` : ''}</span>
        </div>
      )}
      {failed && <div className="model-error">{failText}</div>}
    </div>
  )
}
