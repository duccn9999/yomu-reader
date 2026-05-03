import { XMLParser } from "fast-xml-parser";
import { OpfFile } from "../models/opf_file";
import {
  ZipReader,
  BlobReader,
  type FileEntry,
  TextWriter,
  BlobWriter,
} from "@zip.js/zip.js";
import path from "path-browserify";
import { GenerateDummyImage } from "../utils/dummy_image";
export class EpubService {
  constructor() {}
  static async ExtractEpub(file: Blob) {
    const zipReader = new ZipReader(new BlobReader(file));
    const entries = await zipReader.getEntries();
    const result: Record<string, string | Blob> = {};
    const imgSrcs: Record<string, string> = {};
    const parser = new XMLParser({
      ignoreAttributes: false,
    });

    const fileMap = entries.reduce<Record<string, FileEntry>>((map, cur) => {
      if (!cur.directory) {
        map[cur.filename] = cur as FileEntry;
      }
      return map;
    }, {});
    const containerXml = await fileMap["META-INF/container.xml"].getData!(
      new TextWriter(),
    );
    const container = parser.parse(containerXml);
    const rootFiles = container.container.rootfiles.rootfile;
    const rootFile = Array.isArray(rootFiles) ? rootFiles[0] : rootFiles;
    const opfFilename = rootFile["@_full-path"];

    // get opf file
    const contentOpfXml = await fileMap[opfFilename].getData!(new TextWriter());
    const contentOpf = parser.parse(contentOpfXml) as OpfFile;
    const contentsDir = path.dirname(opfFilename);

    await Promise.all(
      contentOpf.package.manifest.item.map(async (item) => {
        let value: string | Blob;
        const mediaType: string = item["@_media-type"];
        const relativePath = item["@_href"];
        const entry = fileMap[path.join(contentsDir, relativePath)];
        const key = item["@_id"];
        if (!entry) {
          throw new Error(`item ${relativePath} not found`);
        }
        if (entry.getData) {
          if (mediaType.startsWith("image/")) {
            value = await entry.getData(new BlobWriter(mediaType));
            imgSrcs[relativePath] = key;
          } else {
            value = await entry.getData(new TextWriter());
          }
          result[item["@_id"]] = value;
        }
      }),
    );
    const refs = contentOpf.package.spine.itemref;
    const dcTitle = contentOpf.package.metadata["dc:title"];
    const title = typeof dcTitle === "string" ? dcTitle : dcTitle["#text"];
    const metas = Array.isArray(contentOpf.package.metadata.meta)
      ? contentOpf.package.metadata.meta
      : [contentOpf.package.metadata.meta];

    const coverKey = metas.find((x) => x["@_name"] === "cover")?.["@_content"];
    const cover = result[coverKey!] as Blob;
    await zipReader.close();

    return { title, cover, result, refs, imgSrcs };
  }

  static ReplaceImgWithDummyImg(
    html: string,
    imgSrcs: Record<string, string>,
  ): string {
    const parser = new DOMParser();
    let updatedHtml = "";
    let htmlDom = parser.parseFromString(html, "application/xhtml+xml");

    // check if XHTML parsing failed
    const parserError = htmlDom.querySelector("parsererror");

    if (parserError) {
      htmlDom = parser.parseFromString(html, "text/html");
    }

    const imgs = htmlDom.querySelectorAll("img");
    for (const img of imgs) {
      const src = img.getAttribute("src");
      if (!src) continue;

      const key = src.replace(/^(\.\.\/)+/, "");
      const dummyUrl = GenerateDummyImage(imgSrcs[key]);

      img.setAttribute("src", dummyUrl);
    }

    if (htmlDom.contentType === "application/xhtml+xml") {
      updatedHtml = new XMLSerializer().serializeToString(htmlDom);
    } else {
      updatedHtml = htmlDom.documentElement.outerHTML;
    }

    return updatedHtml;
  }
}
