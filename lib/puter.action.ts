import puter from "@heyputer/puter.js";
import { isHostedUrl } from "./utils";
import { getOrCreateHostingConfig, uploadImageToHosting } from "./puter.hosting";

export const sigIn = async () => await puter.auth.signIn();

export const signOut = async () => await puter.auth.signOut();

export const getCurrentUser = async () => {
    try{
        return await puter.auth.getUser();
    } catch {
        return null;
    }
}

export const createProject = async ({ item }: CreateProjectParams):
    Promise<DesignItem | null> => {
        const projectId = item.id;

        const hosting = await getOrCreateHostingConfig();

        const hostedSource = projectId ?
            await uploadImageToHosting({
                hosting,
                url: item.sourceImage,
                projectId,
                label: "source"
            })
            : null;

        const hostedRender = projectId && item.renderedImage ?
            await uploadImageToHosting({
                hosting,
                url: item.renderedImage,
                projectId,
                label: "rendered"
            })
            : null;

        const resolvedSource = hostedSource?.url || (isHostedUrl(item.sourceImage)
            ? item.sourceImage
            : '');

        if(!resolvedSource){
            console.warn('Failed to resolve source image for project');
            return null;
        }

        const resolvedRender = hostedRender?.url 
            ? hostedRender?.url
            : item.renderedImage && isHostedUrl(item.renderedImage)
                ? item.renderedImage
                : undefined;

        const {
            sourcePath: _sourcePath,
            renderedPath: _renderedPath,
            publicPath: _publicPath,
            ...rest
        } = item

        const payload = {
            ...rest,
            sourceImage: resolvedSource,
            renderedImage: resolvedRender,
        }

        try{
            // Call the Puter worker to store project in KV
            return payload;
        }
        catch(e){
            console.warn(`Failed to save project: ${e}`);
            return null;
        }
    }