// 生成站点用图：favicon 全套 + 分享卡片（og:image）。
//
// 用法（JDK 11+ 单文件模式，无需编译）：
//   java scripts/GenSiteImages.java <icon.png> <cover-bg.jpg> <outDir>
//
// 例：
//   java scripts/GenSiteImages.java \
//     "../cobblemarket-template-1.21.1/common/src/main/resources/assets/cobblemarket/icon.png" \
//     docs/cover-bg.jpg docs/images
//
// 素材更新后重跑本脚本即可，不用手工切图。
//
// ===== favicon 的两个关键决策（改之前先读）=====
//
// 1) 缩放用面积平均（box filter），不用最近邻。
//    icon.png 是 816x816 的「高分辨率像素风」图 —— 实测相邻同色像素的连续长度
//    绝大多数是 1（run=1 占 86%），说明它不是「小图整数倍放大」的画法，每个物理
//    像素都是独立绘制的。按最近邻缩到 16px 等于每 51 个像素里随机抽 1 个，采出来
//    全是噪点；面积平均把 51x51 个源像素求均值，等于天然的超采样抗锯齿。
//
// 2) 标签页图标、手机主屏图标、首页 Hero 用的是同一张完整插画，品牌形象统一。
//    唯一的取舍：16px 的标签页图标下细节会糊一些（插画本身的元素太多）。
//    更早期的版本曾裁出中心的精灵球来换清晰度，但那样和 Hero、和模组图标都对不上，
//    用户拍板要统一 —— 所以又换回了完整图。
//
// ===== 抠圆角（让四角透明）=====
// icon.png 是 RGB 无 alpha 的，圆角外面填的是纯黑；游戏里背景暗看不出来，
// 网页上（尤其浅色模式白底、浏览器浅色标签栏）就是四个突兀的黑角。
// 两个易错点记在对应函数上：检测条件不能用「严格等于纯黑」，半径要取顶边与对角线
// 两个方向的较大值（图标的圆角是超椭圆，不是圆弧）。
import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.nio.ByteBuffer;
import java.nio.ByteOrder;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;

public class GenSiteImages {

    /** 分享卡片尺寸（og:image 的标准比例，各大平台通用）。 */
    private static final int OG_W = 1200;
    private static final int OG_H = 630;

    /**
     * 面积平均降采样：每个目标像素 = 对应源矩形内所有像素的均值。
     *
     * ⚠ 通道之间必须按「预乘 alpha」加权，不能各自简单平均：
     *   抠过圆角的图里，圆角外是全透明（alpha=0）但 RGB 仍是黑色的像素。
     *   简单平均会把那些黑按同等权重算进去，在弧线边缘糊出一圈灰黑描边 ——
     *   和文字抗锯齿时"透明底上的黑边"是同一个成因。
     *   预乘之后，透明像素对颜色的贡献自然归零（r/a 会把它约掉）。
     */
    static BufferedImage areaScale(BufferedImage src, int dw, int dh) {
        int sw = src.getWidth(), sh = src.getHeight();
        BufferedImage dst = new BufferedImage(dw, dh, BufferedImage.TYPE_INT_ARGB);
        for (int y = 0; y < dh; y++) {
            int y0 = (int) Math.floor((double) y * sh / dh);
            int y1 = (int) Math.ceil((double) (y + 1) * sh / dh);
            if (y1 <= y0) y1 = y0 + 1;
            for (int x = 0; x < dw; x++) {
                int x0 = (int) Math.floor((double) x * sw / dw);
                int x1 = (int) Math.ceil((double) (x + 1) * sw / dw);
                if (x1 <= x0) x1 = x0 + 1;
                long r = 0, g = 0, b = 0, a = 0, n = 0;
                for (int sy = y0; sy < y1 && sy < sh; sy++) {
                    for (int sx = x0; sx < x1 && sx < sw; sx++) {
                        int c = src.getRGB(sx, sy);
                        int ca = (c >>> 24) & 0xFF;
                        r += ((c >> 16) & 0xFF) * ca;
                        g += ((c >> 8) & 0xFF) * ca;
                        b += (c & 0xFF) * ca;
                        a += ca;
                        n++;
                    }
                }
                if (a == 0) { dst.setRGB(x, y, 0); continue; }   // 整格透明
                dst.setRGB(x, y,
                        ((int) (a / n) << 24) | ((int) (r / a) << 16) |
                        ((int) (g / a) << 8) | (int) (b / a));
            }
        }
        return dst;
    }

    /** 按 cover 语义（填满 + 居中裁剪）缩放到目标尺寸。 */
    static BufferedImage coverScale(BufferedImage src, int dw, int dh) {
        double scale = Math.max((double) dw / src.getWidth(), (double) dh / src.getHeight());
        int tw = (int) Math.ceil(src.getWidth() * scale);
        int th = (int) Math.ceil(src.getHeight() * scale);
        BufferedImage scaled = areaScale(src, tw, th);
        int x = (tw - dw) / 2, y = (th - dh) / 2;
        return scaled.getSubimage(x, y, dw, dh);
    }

    /** 手写 ICO 容器（Vista+ 支持内嵌 PNG 数据，不用 BMP 那套）。 */
    static void writeIco(Path out, List<BufferedImage> imgs) throws Exception {
        List<byte[]> pngs = new ArrayList<>();
        for (BufferedImage im : imgs) {
            ByteArrayOutputStream bos = new ByteArrayOutputStream();
            ImageIO.write(im, "png", bos);
            pngs.add(bos.toByteArray());
        }
        int offset = 6 + 16 * imgs.size();
        int total = offset;
        for (byte[] p : pngs) total += p.length;

        ByteBuffer buf = ByteBuffer.allocate(total).order(ByteOrder.LITTLE_ENDIAN);
        buf.putShort((short) 0).putShort((short) 1).putShort((short) imgs.size()); // ICONDIR
        int pos = offset;
        for (int i = 0; i < imgs.size(); i++) {
            BufferedImage im = imgs.get(i);
            buf.put((byte) (im.getWidth() >= 256 ? 0 : im.getWidth()));   // 0 表示 256
            buf.put((byte) (im.getHeight() >= 256 ? 0 : im.getHeight()));
            buf.put((byte) 0).put((byte) 0);              // 调色板数 / 保留
            buf.putShort((short) 1).putShort((short) 32); // 色平面 / 位深
            buf.putInt(pngs.get(i).length);
            buf.putInt(pos);
            pos += pngs.get(i).length;
        }
        for (byte[] p : pngs) buf.put(p);
        Files.write(out, buf.array());
    }

    static void genFavicons(BufferedImage src, Path outDir) throws Exception {
        // 标签页图标也用完整插画（与首页 Hero 同一张），品牌形象统一。
        // ⚠ 早先版本这里是「裁出中心的精灵球」—— 当时完整插画缩到 16px 会糊成一团灰雾，
        //   而黑角在浅色标签栏上又很突兀，裁球是当时的权衡。现在圆角已经抠成透明，
        //   黑角问题没了，就按用户的要求换回完整图（代价是 16px 下细节仍会糊一些）。
        // 先抠角再缩放，顺序与理由见 genHeroIcon。
        BufferedImage art = roundCorners(src);

        List<BufferedImage> ico = new ArrayList<>();
        for (int s : new int[]{16, 32, 48}) {
            BufferedImage im = areaScale(art, s, s);
            ImageIO.write(im, "png", outDir.resolve("favicon-" + s + ".png").toFile());
            System.out.println("wrote favicon-" + s + ".png");
            ico.add(im);
        }
        writeIco(outDir.resolve("favicon.ico"), ico);
        System.out.println("wrote favicon.ico (" + ico.size() + " sizes)");

        // 手机主屏：同样是完整图（iOS 自己会再裁一次大圆角，但黑角在裁之前就已经露出来了；
        // 而且这张图在 Android 的 PWA 场景下不一定有人帮忙裁）
        ImageIO.write(areaScale(art, 180, 180), "png",
                outDir.resolve("apple-touch-icon.png").toFile());
        System.out.println("wrote apple-touch-icon.png (full art, 圆角已抠)");
    }

    /**
     * 分享卡片。只做「裁成 1200x630 + 压成 JPEG」，不在图上叠任何文字。
     *
     * ⚠ 别往这张图上加标题：封面图 cover-bg.jpg 本身就是一张成品宣传图
     *   （自带 CobbleMarket 像素 logo、御三家立绘、Download 按钮），再叠一层
     *   文字会和图里的 logo 糊成上下两层标题（试过，很乱）。
     *   分享出去时平台会自动在卡片下方渲染 og:title / og:description，
     *   文字信息交给它就行。
     */
    static void genOgImage(BufferedImage cover, Path outDir) throws Exception {
        BufferedImage img = coverScale(cover, OG_W, OG_H);
        // 输出 JPEG 而非 PNG：这张图是照片底，PNG 存出来 1.3MB，而分享卡片的抓取方
        // 通常有体积上限（超了就直接不显示图）。JPEG q=0.88 约 200KB，肉眼看不出差别。
        // ⚠ 必须走 ImageWriter 显式设质量 —— ImageIO.write(img,"jpg",…) 那个便捷方法
        //   没法传 WriteParam，只能用它的默认质量（0.75，写出来发灰）。
        writeJpeg(img, outDir.resolve("og-cover.jpg"), 0.88f);
        System.out.println("wrote og-cover.jpg (" + OG_W + "x" + OG_H + ")");
    }

    /** 按指定质量写 JPEG。 */
    static void writeJpeg(BufferedImage img, Path out, float quality) throws Exception {
        var writer = ImageIO.getImageWritersByFormatName("jpeg").next();
        var param = writer.getDefaultWriteParam();
        param.setCompressionMode(javax.imageio.ImageWriteParam.MODE_EXPLICIT);
        param.setCompressionQuality(quality);
        try (var ios = ImageIO.createImageOutputStream(out.toFile())) {
            writer.setOutput(ios);
            writer.write(null, new javax.imageio.IIOImage(img, null, null), param);
        }
        writer.dispose();
    }

    /**
     * 市场入口按钮的图标（与游戏内 MarketEntryScreen 用的是同一批贴图）。
     * [源文件名, 网站上的文件名]
     */
    private static final String[][] ENTRY_ICONS = {
        {"pokeball_icon.png",      "entry-item.png"},
        {"auction_gavel_left.png", "entry-auction.png"},
        {"buy_order_icon.png",     "entry-buy-order.png"},
    };

    /**
     * 首页「四大交易玩法」卡片的图标 = 游戏内市场入口界面那四个按钮的图标，
     * 这样网站和游戏里的视觉符号对得上（见 MarketEntryScreen.kt 的按钮定义）。
     *
     * 其中精灵市场那张在游戏里是 8 帧小卡比兽动画，网站上照做：把 8 帧拼成一张
     * 横向雪碧图，交给 CSS 的 steps() 逐帧播放（见 index.html 的 .cm-card-icon--sprite）。
     * 拼图而不是让网页加载 8 张图：8 个独立请求既慢又会在切换瞬间闪一下。
     */
    static void genEntryIcons(Path guiDir, Path outDir) throws Exception {
        for (String[] pair : ENTRY_ICONS) {
            Files.copy(guiDir.resolve(pair[0]), outDir.resolve(pair[1]),
                    StandardCopyOption.REPLACE_EXISTING);
            System.out.println("wrote " + pair[1] + "  (from " + pair[0] + ")");
        }

        Path frames = guiDir.resolve("munchlax");
        final int n = 8;   // MarketEntryScreen 里定义的帧数
        BufferedImage first = ImageIO.read(frames.resolve("munchlax_0.png").toFile());
        int fw = first.getWidth(), fh = first.getHeight();
        BufferedImage sheet = new BufferedImage(fw * n, fh, BufferedImage.TYPE_INT_ARGB);
        Graphics2D g = sheet.createGraphics();
        for (int i = 0; i < n; i++) {
            g.drawImage(ImageIO.read(frames.resolve("munchlax_" + i + ".png").toFile()),
                    i * fw, 0, null);
        }
        g.dispose();
        ImageIO.write(sheet, "png", outDir.resolve("entry-pokemon.png").toFile());
        System.out.println("wrote entry-pokemon.png (" + n + " frames, " + (fw * n) + "x" + fh + ")");
    }

    /**
     * 「接近黑」判定。
     * ⚠ 不能用「严格等于 0x000000」：原图边缘带着 010101 这种每通道为 1 的极轻杂色，
     *   严格比对会在 x=0 就判定「进入图形」，半径算出 0 —— 代入 alpha 公式后整张图
     *   恒为 50% 透明（就是那次"整图蒙白雾"的事故）。按亮度求和给个宽松阈值最稳。
     */
    private static boolean isBlackish(int argb) {
        return ((argb >> 16) & 0xFF) + ((argb >> 8) & 0xFF) + (argb & 0xFF) <= 60;
    }

    /**
     * 量出圆角半径。
     *
     * ⚠ 不能只量顶边。这个图标的圆角是「超椭圆」(squircle) 而不是标准圆弧 ——
     *   实测：顶边方向量出 90px，而对角线方向第一个亮点落在 d=33 处，
     *   换算成等效圆弧半径是 33 ÷ (1 − 1/√2) ≈ 113px。
     *   超椭圆的角在坐标轴方向更早变宽、在对角线方向更晚进入，
     *   只按顶边的 90 去抠，四个角在对角线方向就残留一块黑（就是"再删多一点"那次）。
     *   所以两个方向都量、取大的，让圆弧把超椭圆的角整个包住。
     */
    static int detectCornerRadius(BufferedImage img) {
        int w = img.getWidth(), h = img.getHeight();

        int edge = 0;                       // 顶边方向：第一个不再是接近黑的像素
        for (int x = 0; x < w; x++) {
            if (!isBlackish(img.getRGB(x, 0))) { edge = x; break; }
        }

        int diag = 0;                       // 对角线方向：沿 45° 往里找第一个不再接近黑的
        int lim = Math.min(w, h);
        for (int d = 0; d < lim; d++) {
            if (!isBlackish(img.getRGB(d, d))) { diag = d; break; }
        }
        // 半径 r 的圆弧在对角线上出现在 d = r·(1 − 1/√2) 处，反解出等效半径
        int fromDiag = (int) Math.round(diag / (1 - 1 / Math.sqrt(2)));

        return Math.max(edge, fromDiag);
    }

    /**
     * 把四角的黑色抠成透明。
     *
     * 模组 icon.png 是 RGB 无 alpha 的，圆角外面那圈是纯黑 —— 游戏里背景本来就深、
     * 看不出来，但网页上（尤其浅色模式的白底）就是四个突兀的黑角。
     *
     * ⚠ 必须按「圆角矩形的几何」抠，不能按颜色抠：图标内部本来就有大片深色背景，
     *   把黑色一律变透明会连图一起挖空。
     * 边缘留 1px 的渐变做抗锯齿，否则弧线会是硬邦邦的锯齿（原图在黑角与图形之间
     * 本来就有一层过渡色，这里再叠一层，衔接更干净）。
     */
    static BufferedImage roundCorners(BufferedImage src) {
        int w = src.getWidth(), h = src.getHeight();
        int r = detectCornerRadius(src);
        System.out.println("  corner radius = " + r + "px  (image " + w + "x" + h + ")");
        // 半径算错会静默产出「整图半透明」这种一眼看不出原因的废图，宁可吵一点
        if (r <= 0) {
            System.err.println("  !! WARNING: 圆角半径检测为 0，抠角会失效（整图变半透明）");
            System.err.println("     多半是图标边缘不是接近黑 —— 检查 isBlackish 的阈值");
        }
        BufferedImage dst = new BufferedImage(w, h, BufferedImage.TYPE_INT_ARGB);
        for (int y = 0; y < h; y++) {
            for (int x = 0; x < w; x++) {
                int c = src.getRGB(x, y);
                double px = x + 0.5, py = y + 0.5;
                // 把点夹进「四个圆心所在的矩形」，夹不动的那部分就是落在某个角区
                double cx = Math.min(Math.max(px, r), w - r);
                double cy = Math.min(Math.max(py, r), h - r);
                double d = Math.hypot(px - cx, py - cy);
                double a = Math.max(0, Math.min(1, r - d + 0.5));
                if (a <= 0) continue;                      // 圆角外：保持全透明
                dst.setRGB(x, y, ((int) Math.round(a * 255) << 24) | (c & 0xFFFFFF));
            }
        }
        return dst;
    }

    /**
     * 首页 Hero 的大图标。
     * 用完整插画（而不是裁出来的小球）—— 这里显示尺寸 160px，细节撑得住；
     * 输出 320px 是给 2 倍屏用的（160 × 2），再大就只是徒增体积。
     *
     * ⚠ 顺序必须是「先抠角、再缩放」：
     *   缩放的面积平均会把「黑角 / 图形」的边界糊成一片过渡色，之后再去量圆角半径
     *   就会偏小，抠出来的弧线比图里真正的边框圆角小一圈、外侧留一道残黑（踩过）。
     *   在原图（816px）上抠，边界是干净的，半径量得准；缩放时透明边缘自带平滑。
     */
    static void genHeroIcon(BufferedImage icon, Path outDir) throws Exception {
        ImageIO.write(areaScale(roundCorners(icon), 320, 320), "png",
                outDir.resolve("hero-icon.png").toFile());
        System.out.println("wrote hero-icon.png (320x320, 显示 160px @2x)");
    }

    public static void main(String[] args) throws Exception {
        if (args.length < 3) {
            System.err.println("usage: java GenSiteImages.java <icon.png> <cover-bg.jpg> <outDir> [gui纹理目录]");
            System.err.println("  gui纹理目录 传了就顺带生成入口按钮图标（网站首页卡片用），省了可跳过");
            System.exit(2);
        }
        Path outDir = Paths.get(args[2]);
        Files.createDirectories(outDir);

        BufferedImage icon = ImageIO.read(new File(args[0]));
        System.out.println("icon " + icon.getWidth() + "x" + icon.getHeight());
        genFavicons(icon, outDir);
        genHeroIcon(icon, outDir);

        BufferedImage cover = ImageIO.read(new File(args[1]));
        System.out.println("cover " + cover.getWidth() + "x" + cover.getHeight());
        genOgImage(cover, outDir);

        if (args.length >= 4) {
            Path guiDir = Paths.get(args[3]);
            System.out.println("gui textures " + guiDir);
            genEntryIcons(guiDir, outDir);
        }
    }
}
