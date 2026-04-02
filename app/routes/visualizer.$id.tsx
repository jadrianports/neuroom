import { useEffect, useState } from 'react'
import { useLocation, useParams } from 'react-router'
import puter from '@heyputer/puter.js'

const Visualizer = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const state = location.state as VisualizerLocationState | null;

  const [initialImage, setInitialImage] = useState<string | undefined>(state?.initialImage);
  const [name, setName] = useState<string | null | undefined>(state?.name);
  const [loading, setLoading] = useState(!state?.initialImage);

  useEffect(() => {
    if (state?.initialImage || !id) return;

    const loadFromKV = async () => {
      try {
        const raw = await puter.kv.get(`project:${id}`);
        if (raw) {
          const project: DesignItem = typeof raw === 'string' ? JSON.parse(raw) : raw;
          setInitialImage(project.sourceImage);
          setName(project.name);
        }
      } catch (e) {
        console.warn(`Failed to load project from KV: ${e}`);
      } finally {
        setLoading(false);
      }
    };

    loadFromKV();
  }, [id, state]);

  if (loading) {
    return (
      <section className="visualizer-route loading">
        <p>Loading project...</p>
      </section>
    );
  }

  return (
    <section>
      <h1>{name || 'Untitled Image'}</h1>

      <div className='visualizer'>
        {initialImage && (
          <div className='image-container'>
            <h2>Source Image</h2>
            <img src={initialImage} alt="source" />
          </div>
        )}
      </div>
    </section>
  )
}

export default Visualizer