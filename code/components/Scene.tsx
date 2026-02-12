import React, { Suspense, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, useTexture, Html } from '@react-three/drei';
import * as THREE from 'three';

// --- Tipos ---
interface SceneProps {
  imageUrl: string;
}

// --- Componente de Controle de Zoom (FOV) ---
const FovZoomController: React.FC = () => {
  const { camera, gl } = useThree();

  useEffect(() => {
    const handleWheel = (event: WheelEvent) => {
      // Impede o scroll da página enquanto dá zoom no 360
      event.preventDefault();

      if (camera instanceof THREE.PerspectiveCamera) {
        const zoomSpeed = 0.05; // Ajustado para ser mais suave
        const delta = event.deltaY * zoomSpeed;

        // Limita o FOV entre 45 (zoom in) e 110 (zoom out)
        const newFov = THREE.MathUtils.clamp(camera.fov + delta, 20, 95);

        // Só atualiza se houver mudança real
        if (camera.fov !== newFov) {
          camera.fov = newFov;
          camera.updateProjectionMatrix();
        }
      }
    };

    // Usa gl.domElement: é a referência direta e segura ao <canvas> do R3F
    const canvasElement = gl.domElement;
    canvasElement.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      canvasElement.removeEventListener('wheel', handleWheel);
    };
  }, [camera, gl]);

  return null;
};

// --- Componente da Esfera 360 ---
const PanoramaSphere: React.FC<{ imageUrl: string }> = ({ imageUrl }) => {
  const texture = useTexture(imageUrl);

  // Configuração da Textura
  useEffect(() => {
    // Garante renderização correta de cores (evita aspecto "lavado")
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;

    return () => {
      // Limpeza Agressiva de VRAM para imagens pesadas (4k/8k)
      texture.dispose();
    };
  }, [texture]);

  return (
    <mesh scale={[-1, 1, 1]}>
      {/* Geometria com segmentos suficientes para evitar distorção nos polos */}
      <sphereGeometry args={[500, 64, 32]} />
      <meshBasicMaterial 
        map={texture} 
        side={THREE.BackSide} 
        toneMapped={false} // Importante para manter a fidelidade da foto
      />
    </mesh>
  );
};

// --- Loader Customizado ---
const Loader = () => (
  <Html center>
    <div className="flex flex-col items-center gap-3 p-4 bg-black/50 rounded-lg backdrop-blur-sm">
      <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      <span className="text-xs font-mono text-white tracking-widest uppercase">
        Carregando Ambiente
      </span>
    </div>
  </Html>
);

// --- Cena Principal ---
export default function Scene({ imageUrl }: SceneProps) {
  return (
    <div className="w-full h-full relative bg-gray-900">
      <Canvas
        camera={{ position: [0, 0, 0.1], fov: 75 }}
        className="w-full h-full outline-none" // outline-none remove borda de foco
        dpr={[1, 2]} // Otimiza para telas retina, mas limita a 2x para performance
        gl={{ 
          antialias: true, 
          toneMapping: THREE.NoToneMapping, // Desativa tone mapping do ThreeJS para usar cor real da foto
          preserveDrawingBuffer: true 
        }}
      >
        {/* Controlador de Zoom customizado via FOV */}
        <FovZoomController />

        {/* Controles de Rotação (Zoom nativo desativado para usar o nosso FOV) */}
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          enableDamping={true}
          dampingFactor={0.05}
          rotateSpeed={-0.5} // Invertido para sensação de "arrastar o ambiente"
          target={[0, 0, 0]} // Garante que a câmera gire em torno do próprio eixo
        />

        <Suspense fallback={<Loader />}>
          <PanoramaSphere imageUrl={imageUrl} />
        </Suspense>
      </Canvas>
    </div>
  );
}

// Pré-carregar a textura se necessário (Opcional, fora do componente)
// useTexture.preload(imageUrl);