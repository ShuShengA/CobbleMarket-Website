import javax.imageio.*;
import javax.imageio.stream.*;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.File;

/**
 * 按「最大宽度 + 质量」重编码 JPEG。
 * 用法：java ShrinkJpg.java <输入> <输出> [最大宽度=1720] [质量=0.85]
 *
 * 为什么要缩宽度：网站正文最宽只显示 860px，高清屏（DPR 2）下需要 1720px，
 * 原图 2048px 多出来的部分对观感没有贡献，只增加首屏加载体积。
 */
public class ShrinkJpg {
    public static void main(String[] args) throws Exception {
        File in = new File(args[0]);
        File out = new File(args[1]);
        int maxW = args.length > 2 ? Integer.parseInt(args[2]) : 1720;
        float q = args.length > 3 ? Float.parseFloat(args[3]) : 0.85f;

        BufferedImage src = ImageIO.read(in);
        if (src == null) { System.out.println("读不了: " + in); return; }
        int w = src.getWidth(), h = src.getHeight();

        BufferedImage img = src;
        if (w > maxW) {
            int nw = maxW;
            int nh = Math.round(h * (float) maxW / w);
            img = new BufferedImage(nw, nh, BufferedImage.TYPE_INT_RGB);
            Graphics2D g = img.createGraphics();
            g.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BICUBIC);
            g.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);
            g.drawImage(src, 0, 0, nw, nh, null);
            g.dispose();
        } else if (src.getType() != BufferedImage.TYPE_INT_RGB) {
            // 不需要缩放时也必须转成 RGB：JPEG 不支持 alpha 通道，
            // 直接把 RGBA 丢给 writer 会抛 "Bogus input colorspace"
            //（游戏截图存 PNG 时都是 RGBA，所以只要 maxW >= 原宽就会踩到）
            img = new BufferedImage(w, h, BufferedImage.TYPE_INT_RGB);
            Graphics2D g = img.createGraphics();
            g.drawImage(src, 0, 0, null);
            g.dispose();
        }

        ImageWriter writer = ImageIO.getImageWritersByFormatName("jpeg").next();
        ImageWriteParam p = writer.getDefaultWriteParam();
        p.setCompressionMode(ImageWriteParam.MODE_EXPLICIT);
        p.setCompressionQuality(q);

        try (ImageOutputStream os = ImageIO.createImageOutputStream(out)) {
            writer.setOutput(os);
            writer.write(null, new IIOImage(img, null, null), p);
        }
        writer.dispose();

        System.out.printf("%-22s %5d KB -> %5d KB   %dx%d%n",
                out.getName(), in.length() / 1024, out.length() / 1024,
                img.getWidth(), img.getHeight());
    }
}
